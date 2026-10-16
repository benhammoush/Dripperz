/**
 * Trusted delivery controller: exact-source selection, static bundle preparation,
 * read-only preflight and a single provider mutation followed by identity smoke.
 * Not invoked locally for deployment during PR 2 implementation.
 * @file
 */

import { readFile, readdir, writeFile, appendFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import {
  REPOSITORY,
  requireDelivery,
  sourceRevision,
  projectName,
  fingerprint,
  staticHostingConfiguration,
  projectConfiguration,
  assertDeployment,
} from './delivery-contract.mjs';

const env = process.env;

/**
 * Read required process configuration without including its value in diagnostics.
 * @param name - Required environment variable name.
 * @returns Nonempty configured value.
 */
function required(name) {
  requireDelivery(Boolean(env[name]), `Missing ${name}`);
  return env[name];
}

/**
 * Call an authenticated API with bounded waits and safe errors. Mutations are never
 * retried: ambiguous failures require provider inspection before another action.
 * @param service - GitHub source metadata or the selected target's provider API.
 * @param path - Relative endpoint, constructed only by this trusted controller.
 * @param body - Optional deployment request; absent means read-only GET.
 * @returns Parsed successful API response.
 */
async function api(service, path, body) {
  const github = service === 'github';
  const credential = github ? 'GH_TOKEN' : 'VERCEL_TOKEN';
  const response = await fetch(
    `${github ? 'https://api.github.com' : 'https://api.vercel.com'}${path}`,
    {
      method: body ? 'POST' : 'GET',
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
      headers: {
        Authorization: `Bearer ${required(credential)}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(github ? { 'X-GitHub-Api-Version': '2022-11-28' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    },
  );
  requireDelivery(
    response.ok,
    `${service} API failed (${response.status}); inspect before retry`,
  );
  return response.json();
}

/**
 * Verify selected history against current main; automatic dev never deploys a
 * superseded CI run. Manual selection may intentionally use an older merged SHA.
 * @param revision - Full selected SHA.
 * @param automatic - Whether latest-main identity must still hold.
 */
async function mergedSource(revision, automatic) {
  sourceRevision(revision);
  const main = await api('github', `/repos/${REPOSITORY}/branches/main`);
  const comparison = await api(
    'github',
    `/repos/${REPOSITORY}/compare/${revision}...${main.commit.sha}`,
  );
  requireDelivery(
    ['ahead', 'identical'].includes(comparison.status),
    'Source is not an ancestor of main',
  );
  requireDelivery(
    !automatic || revision === main.commit.sha,
    'Automatic dev run was superseded',
  );
}

/**
 * Resolve only the successful trusted main CI event or an explicit main dispatch.
 * Emit safe GitHub outputs, not shell expressions sourced from user input.
 */
export async function select() {
  requireDelivery(
    required('GITHUB_REPOSITORY') === REPOSITORY,
    'Unexpected repository',
  );
  const event = JSON.parse(
    await readFile(required('GITHUB_EVENT_PATH'), 'utf8'),
  );
  const automatic = env.GITHUB_EVENT_NAME === 'workflow_run';
  let revision;
  let target;
  if (automatic) {
    const run = event.workflow_run;
    requireDelivery(
      run?.conclusion === 'success' &&
        run.event === 'push' &&
        run.head_branch === 'main' &&
        run.head_repository?.full_name === REPOSITORY &&
        run.path === '.github/workflows/ci.yml',
      'Only successful repository main CI pushes can deploy automatically',
    );
    revision = run.head_sha;
    target = 'dev';
  } else {
    requireDelivery(
      env.GITHUB_EVENT_NAME === 'workflow_dispatch' &&
        env.GITHUB_REF === 'refs/heads/main',
      'Dispatch must run from main',
    );
    revision = event.inputs?.sha;
    target = event.inputs?.target;
  }
  projectName(target);
  await mergedSource(sourceRevision(revision), automatic);
  await appendFile(
    required('GITHUB_OUTPUT'),
    `revision=${revision}\ntarget=${target}\nautomatic=${automatic}\n`,
  );
}

/**
 * Enumerate only regular static files. Symlinks and unexpected node types fail
 * before upload, preventing reads outside the checked build output.
 * @param directory - Root-relative directory to enumerate.
 * @returns Sorted file names relative to the working directory.
 */
async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) result.push(...(await files(path)));
    else {
      requireDelivery(
        entry.isFile(),
        'Only regular static build files are allowed',
      );
      result.push(path);
    }
  }
  return result.sort();
}

/**
 * Compute build content identity independently of run/target delivery metadata.
 * @returns Hash of file names and bytes, excluding only the identity document.
 */
async function bundleDigest() {
  const manifest = [];
  for (const path of await files('dist')) {
    if (path === 'dist/delivery.json') continue;
    manifest.push([path.slice(5), (await readFile(path)).toString('base64')]);
  }
  return fingerprint(manifest);
}

/**
 * Prepare the tested static bundle and identity. Both targets remain noindex until
 * the later metadata/indexing milestone is explicitly approved.
 */
async function prepare() {
  const revision = sourceRevision(required('DELIVERY_REVISION'));
  const target = required('DELIVERY_TARGET');
  projectName(target);
  const actual = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
  requireDelivery(
    actual === revision,
    'Build checkout differs from selected source',
  );
  requireDelivery(
    execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], {
      encoding: 'utf8',
    }).trim() === '',
    'Tracked source changed during checks/build',
  );
  const metadata = JSON.parse(await readFile('package.json', 'utf8'));
  await writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n');
  await writeFile(
    'dist/vercel.json',
    JSON.stringify(staticHostingConfiguration()),
  );
  const identity = {
    schema: 1,
    revision,
    version: metadata.version,
    target,
    runId: required('GITHUB_RUN_ID'),
    bundleDigest: await bundleDigest(),
  };
  await writeFile('dist/delivery.json', `${JSON.stringify(identity)}\n`);
}

/**
 * Verify readable HTTPS root and exact public source/version/build identity.
 * Redirects fail rather than silently accepting a login page or another target.
 * @param hostname - Validated immutable or stable Vercel hostname.
 * @param identity - Expected public build identity.
 */
async function smoke(hostname, identity) {
  requireDelivery(
    /^[a-z0-9-]+\.vercel\.app$/.test(hostname ?? ''),
    'Unexpected deployment hostname',
  );
  for (const path of ['/', '/delivery.json', '/robots.txt']) {
    const response = await fetch(`https://${hostname}${path}`, {
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
      cache: 'no-store',
    });
    requireDelivery(response.status === 200, 'Hosted smoke failed');
    requireDelivery(
      response.headers.get('x-robots-tag') === 'noindex, nofollow',
      'Nonindexing header missing',
    );
    requireDelivery(
      response.headers.get('cache-control') === 'no-store',
      'Identity cache policy missing',
    );
    if (path === '/delivery.json') {
      const actual = await response.json();
      requireDelivery(
        [
          'schema',
          'revision',
          'version',
          'target',
          'bundleDigest',
          'runId',
        ].every((key) => actual[key] === identity[key]),
        'Hosted identity differs from selected bundle',
      );
    } else if (path === '/robots.txt') {
      requireDelivery(
        (await response.text()) === 'User-agent: *\nDisallow: /\n',
        'Nonindexing robots missing',
      );
    } else {
      requireDelivery(
        (await response.text()).includes('<div id="root">'),
        'Hosted application shell missing',
      );
    }
  }
}

/**
 * Recheck API-backed evidence immediately before the single deployment mutation.
 * Serialize this entire operation in the workflow's per-target job concurrency.
 */
export async function deploy() {
  requireDelivery(
    env.GITHUB_REPOSITORY === REPOSITORY &&
      env.GITHUB_REF === 'refs/heads/main',
    'Delivery controller must run from repository main',
  );
  requireDelivery(env.DEPLOY_ENABLED === 'true', 'Delivery remains disabled');
  const revision = sourceRevision(required('DELIVERY_REVISION'));
  const target = required('DELIVERY_TARGET');
  const name = projectName(target);
  if (target === 'production') {
    requireDelivery(
      env.GITHUB_EVENT_NAME === 'workflow_dispatch' &&
        env.GITHUB_RUN_ATTEMPT === '1',
      'Production requires a new manual dispatch and native approval',
    );
  }
  // GitHub enforces the job's native environment gate before this controller
  // starts. Policy readback is an operator prerequisite, not a runtime API check.
  const teamId = required('VERCEL_TEAM_ID');
  const devId = required('VERCEL_DEV_PROJECT_ID');
  const productionId = required('VERCEL_PRODUCTION_PROJECT_ID');
  requireDelivery(
    /^team_[a-zA-Z0-9]+$/.test(teamId) &&
      [devId, productionId].every((id) => /^prj_[a-zA-Z0-9]+$/.test(id)) &&
      devId !== productionId,
    'Explicit, distinct provider identities required',
  );
  const suffix = `?teamId=${encodeURIComponent(teamId)}`;
  // Project-scoped tokens cannot read team endpoints. Each project's accountId
  // below must instead match the explicit team identity verified during setup.
  const projectId = target === 'dev' ? devId : productionId;
  const identity = JSON.parse(await readFile('dist/delivery.json', 'utf8'));
  requireDelivery(
    identity.schema === 1 &&
      identity.revision === revision &&
      identity.target === target &&
      identity.runId === required('GITHUB_RUN_ID') &&
      identity.bundleDigest === (await bundleDigest()),
    'Downloaded bundle identity or content mismatch',
  );
  const project = await api('vercel', `/v9/projects/${projectId}${suffix}`);
  const domains = await api(
    'vercel',
    `/v9/projects/${projectId}/domains${suffix}`,
  );
  const configDigest = projectConfiguration(
    project,
    domains,
    target,
    teamId,
    projectId,
  );
  // Dev acceptance and recovery are reviewed by the owner before native approval.
  // Production never receives a dev credential or automatically reads dev resources.
  const priorDeploymentId = project.targets?.production?.id ?? null;
  if (target === 'production') {
    requireDelivery(
      project.targets?.production == null ||
        /^dpl_[a-zA-Z0-9]+$/.test(priorDeploymentId ?? ''),
      'Existing production target has no valid deployment identity; inspect provider',
    );
  }
  // The approved bootstrap policy permits no predecessor, not fabricated rollback
  // evidence. Dev acceptance/rehearsal and this limitation are owner-reviewed
  // before native approval; the controller never infers them from a source SHA.
  const productionBootstrap =
    target === 'production' && priorDeploymentId === null;
  const upload = [];
  for (const path of await files('dist')) {
    upload.push({
      file: path.slice(5),
      data: (await readFile(path)).toString('base64'),
      encoding: 'base64',
    });
  }
  const body = {
    name,
    project: projectId,
    target: 'production',
    files: upload,
    projectSettings: {
      framework: null,
      buildCommand: '',
      installCommand: '',
      outputDirectory: '.',
      rootDirectory: null,
      nodeVersion: '24.x',
    },
    meta: {
      revision,
      version: identity.version,
      bundleDigest: identity.bundleDigest,
      configDigest,
      runId: identity.runId,
    },
  };
  // This bounded inline uploader is for the source foundation, not future 3D assets.
  requireDelivery(
    Buffer.byteLength(JSON.stringify(body)) <= 4_000_000,
    'Bundle exceeds foundation inline-upload limit',
  );
  await mergedSource(revision, env.DELIVERY_AUTOMATIC === 'true');
  const latestProject = await api(
    'vercel',
    `/v9/projects/${projectId}${suffix}`,
  );
  const latestDomains = await api(
    'vercel',
    `/v9/projects/${projectId}/domains${suffix}`,
  );
  requireDelivery(
    projectConfiguration(
      latestProject,
      latestDomains,
      target,
      teamId,
      projectId,
    ) === configDigest &&
      (target !== 'production' ||
        latestProject.targets?.production == null ||
        /^dpl_[a-zA-Z0-9]+$/.test(latestProject.targets.production.id ?? '')) &&
      latestProject.targets?.production?.id === project.targets?.production?.id,
    'Target configuration or recovery identity changed during preflight',
  );
  const record = {
    ...identity,
    configDigest,
    teamId,
    projectId,
    priorDeploymentId,
    productionBootstrap,
    startedAt: new Date().toISOString(),
    status: 'mutation-requested',
  };
  await writeFile(
    'delivery-record.json',
    `${JSON.stringify(record, null, 2)}\n`,
  );
  let deployment = await api('vercel', `/v13/deployments${suffix}`, body);
  record.deploymentId = deployment.id;
  record.status = 'verification-pending';
  await writeFile(
    'delivery-record.json',
    `${JSON.stringify(record, null, 2)}\n`,
  );
  for (
    let attempt = 0;
    attempt < 90 && deployment.readyState !== 'READY';
    attempt++
  ) {
    requireDelivery(
      !['ERROR', 'CANCELED', 'BLOCKED'].includes(deployment.readyState),
      'Deployment did not become READY; inspect provider',
    );
    await setTimeout(2000);
    deployment = await api(
      'vercel',
      `/v13/deployments/${encodeURIComponent(record.deploymentId)}${suffix}`,
    );
  }
  assertDeployment(deployment, record, projectId);
  await smoke(deployment.url, identity);
  await smoke(`${name}.vercel.app`, identity);
  const after = await api('vercel', `/v9/projects/${projectId}${suffix}`);
  requireDelivery(
    after.targets?.production?.id === deployment.id,
    'Provider target no longer points to selected deployment',
  );
  record.url = `https://${deployment.url}`;
  record.status = 'smoke-verified-not-user-accepted';
  await writeFile(
    'delivery-record.json',
    `${JSON.stringify(record, null, 2)}\n`,
  );
  await appendFile(
    required('GITHUB_STEP_SUMMARY'),
    `## ${target} delivery\n\nSource: \`${revision}\`\nVersion: \`${identity.version}\`\nDeployment: \`${deployment.id}\`\nURL: ${record.url}\n\n${productionBootstrap ? 'Production bootstrap: no prior production restore identity was available at preflight. Retain this deployment as a future rollback candidate only after user acceptance.\n\n' : ''}Automated identity smoke passed; user acceptance/recovery remain separate.\n`,
  );
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  const command = process.argv[2];
  requireDelivery(
    ['select', 'prepare', 'deploy'].includes(command),
    'Expected select, prepare or deploy',
  );
  if (command === 'select') await select();
  if (command === 'prepare') await prepare();
  if (command === 'deploy') await deploy();
}
