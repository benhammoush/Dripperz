/**
 * Prove delivery identity, isolated configuration and approval contracts fail closed.
 * Fixtures contain only synthetic public IDs; no network or mutations are used.
 * @file
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deploy, select } from '../../scripts/delivery.mjs';
import {
  sourceRevision,
  projectName,
  fingerprint,
  assertMainProtection,
  assertProductionGate,
  projectConfiguration,
  assertDeployment,
  promotionEvidence,
  staticHostingConfiguration,
} from '../../scripts/delivery-contract.mjs';

/**
 * Exercise the actual controller in an isolated directory with synthetic APIs.
 * All fetches are intercepted; unknown endpoints throw rather than using network.
 * @param scenario - Failure/success scenario to simulate.
 * @param run - Assertion callback receiving captured requests and fixture paths.
 */
async function withController(scenario, run) {
  const production =
    scenario.startsWith('production-') && scenario !== 'production-disabled';
  const root =
    process.platform === 'win32' ? join(tmpdir(), 'opencode') : tmpdir();
  const directory = await mkdtemp(join(root, 'dripperz-delivery-test-'));
  const originalCwd = process.cwd();
  const originalFetch = globalThis.fetch;
  const settings = {
    GITHUB_REPOSITORY: 'benhammoush/Dripperz',
    GITHUB_REF: 'refs/heads/main',
    GH_TOKEN: 'synthetic-github',
    VERCEL_TOKEN: 'synthetic-vercel',
    VERCEL_DEV_VERIFICATION_TOKEN: 'synthetic-dev-verification',
    DELIVERY_ENABLED: 'true',
    PRODUCTION_DELIVERY_ENABLED: production ? 'true' : 'false',
    DELIVERY_REVISION: 'a'.repeat(40),
    DELIVERY_TARGET: production ? 'production' : 'dev',
    DELIVERY_AUTOMATIC: production ? 'false' : 'true',
    PROMOTION_EVIDENCE: '',
    VERCEL_TEAM_ID: 'team_test',
    VERCEL_DEV_PROJECT_ID: 'prj_dev',
    VERCEL_PRODUCTION_PROJECT_ID: 'prj_production',
    GITHUB_RUN_ID: '100',
    GITHUB_STEP_SUMMARY: join(directory, 'summary.md'),
    GITHUB_OUTPUT: join(directory, 'output.txt'),
    GITHUB_EVENT_PATH: join(directory, 'event.json'),
    GITHUB_EVENT_NAME: 'workflow_run',
  };
  const previous = Object.fromEntries(
    Object.keys(settings).map((key) => [key, process.env[key]]),
  );
  const requests = [];
  const fixture = staticProject();
  const productionFixture = staticProject();
  productionFixture.project.id = 'prj_production';
  productionFixture.project.name = 'dripperz-production';
  productionFixture.domains.domains[0].name = 'dripperz-production.vercel.app';
  const staticFiles = [
    ['index.html', '<div id="root"></div>'],
    ['robots.txt', 'User-agent: *\nDisallow: /\n'],
    ['vercel.json', JSON.stringify(staticHostingConfiguration())],
  ];
  const identity = {
    schema: 1,
    revision: settings.DELIVERY_REVISION,
    version: '0.1.0',
    target: production ? 'production' : 'dev',
    runId: '100',
    bundleDigest: fingerprint(
      staticFiles.map(([name, data]) => [
        name,
        Buffer.from(data).toString('base64'),
      ]),
    ),
  };
  const candidateIdentity = { ...identity, target: 'dev', runId: '90' };
  const recoveryIdentity = {
    ...candidateIdentity,
    revision: 'b'.repeat(40),
    version: '0.0.9',
    bundleDigest: 'recovery',
    runId: '80',
  };
  const priorIdentity = {
    ...identity,
    revision: 'c'.repeat(40),
    version: '0.0.8',
    bundleDigest: 'prior',
    runId: '70',
  };
  const devConfig = checkProject(fixture);
  const prodConfig = projectConfiguration(
    productionFixture.project,
    productionFixture.domains,
    'production',
    'team_test',
    'prj_production',
  );
  const evidence = {
    candidate: {
      ...candidateIdentity,
      deploymentId: 'dpl_candidate',
      configDigest: devConfig,
    },
    recovery: {
      ...recoveryIdentity,
      devDeploymentId: 'dpl_recovery',
      configDigest: devConfig,
      restoredCandidateDeploymentId: 'dpl_candidate',
      rehearsalRunUrl:
        'https://github.com/benhammoush/Dripperz/actions/runs/80',
    },
    production: {
      ...priorIdentity,
      deploymentId: 'dpl_prior',
      configDigest: prodConfig,
    },
    acceptance: {
      reviewer: 'benhammoush',
      at:
        scenario === 'production-early-acceptance'
          ? '2025-01-01T00:00:00Z'
          : '2026-01-02T00:00:00Z',
      runUrl: 'https://github.com/benhammoush/Dripperz/actions/runs/90',
    },
  };
  const existing = Object.fromEntries(
    [
      ['dpl_candidate', candidateIdentity, 'prj_dev', devConfig],
      ['dpl_recovery', recoveryIdentity, 'prj_dev', devConfig],
      ['dpl_prior', priorIdentity, 'prj_production', prodConfig],
    ].map(([id, publicIdentity, projectId, configDigest]) => [
      id,
      {
        id,
        projectId,
        readyState: 'READY',
        target: 'production',
        url: `${id.replaceAll('_', '-')}.vercel.app`,
        createdAt: Date.UTC(2026, 0, 1),
        meta: { ...publicIdentity, configDigest },
      },
    ]),
  );
  let projectReads = 0;
  let created;
  try {
    process.chdir(directory);
    Object.assign(process.env, settings);
    process.env.PROMOTION_EVIDENCE = JSON.stringify(evidence);
    await mkdir('dist');
    for (const [name, data] of staticFiles)
      await writeFile(`dist/${name}`, data);
    await writeFile('dist/delivery.json', JSON.stringify(identity));
    await writeFile(
      'event.json',
      JSON.stringify({
        workflow_run: {
          conclusion: 'success',
          event: 'push',
          head_branch: 'main',
          head_repository: { full_name: 'benhammoush/Dripperz' },
          path: '.github/workflows/ci.yml',
          head_sha: identity.revision,
        },
      }),
    );
    globalThis.fetch = async (input, options = {}) => {
      const url = new URL(input);
      requests.push({
        url: url.href,
        method: options.method ?? 'GET',
        body: options.body ? JSON.parse(options.body) : undefined,
      });
      let result;
      if (url.hostname === 'api.github.com') {
        assert.equal(options.headers.Authorization, 'Bearer synthetic-github');
        if (url.pathname.endsWith('/branches/main')) {
          result = {
            commit: {
              sha:
                scenario === 'superseded' ? 'b'.repeat(40) : identity.revision,
            },
          };
        } else if (url.pathname.includes('/compare/')) {
          result = {
            status: scenario === 'unmerged' ? 'diverged' : 'identical',
          };
        } else
          throw new Error(
            `Unexpected synthetic GitHub endpoint: ${url.pathname}`,
          );
      } else if (url.hostname === 'api.vercel.com') {
        const devRead =
          production &&
          (url.pathname.startsWith('/v9/projects/prj_dev') ||
            /\/v13\/deployments\/dpl_(candidate|recovery)$/.test(url.pathname));
        assert.equal(
          options.headers.Authorization,
          `Bearer ${devRead ? 'synthetic-dev-verification' : 'synthetic-vercel'}`,
        );
        if (devRead) assert.equal(options.method, 'GET');
        if (url.pathname === '/v9/projects/prj_dev/domains')
          result = fixture.domains;
        else if (url.pathname === '/v9/projects/prj_dev') {
          projectReads++;
          result = structuredClone(fixture.project);
          if (scenario === 'drift' && projectReads > 1)
            result.nodeVersion = '22.x';
          if (production)
            result.targets = { production: { id: 'dpl_candidate' } };
          if (scenario === 'production-late-dev-drift' && projectReads > 1)
            result.targets.production.id = 'dpl_changed';
          if (scenario === 'production-candidate-drift')
            result.targets.production.id = 'dpl_changed';
          if (created && !production)
            result.targets = { production: { id: created.id } };
        } else if (url.pathname === '/v9/projects/prj_production/domains')
          result = productionFixture.domains;
        else if (url.pathname === '/v9/projects/prj_production') {
          result = {
            ...productionFixture.project,
            targets: { production: { id: created?.id ?? 'dpl_prior' } },
          };
          if (scenario === 'production-empty') delete result.targets;
        } else if (url.pathname.startsWith('/v13/deployments/')) {
          result = structuredClone(existing[url.pathname.split('/').at(-1)]);
          if (
            scenario === 'production-recovery-mismatch' &&
            result.id === 'dpl_recovery'
          )
            result.meta.bundleDigest = 'wrong';
          if (
            scenario === 'production-prior-mismatch' &&
            result.id === 'dpl_prior'
          )
            result.meta.revision = 'wrong';
          if (
            scenario === 'production-run-mismatch' &&
            result.id === 'dpl_candidate'
          )
            result.meta.runId = '89';
        } else if (
          url.pathname === '/v13/deployments' &&
          options.method === 'POST'
        ) {
          if (scenario === 'ambiguous-post')
            throw new Error('Synthetic lost deployment response');
          created = {
            id: 'dpl_created',
            projectId: production ? 'prj_production' : 'prj_dev',
            readyState: 'READY',
            target: 'production',
            url: production
              ? 'dripperz-production-immutable.vercel.app'
              : 'dripperz-dev-immutable.vercel.app',
            meta: JSON.parse(options.body).meta,
          };
          result = created;
        } else
          throw new Error(
            `Unexpected synthetic Vercel endpoint: ${url.pathname}`,
          );
      } else if (
        [
          'dripperz-dev.vercel.app',
          'dripperz-dev-immutable.vercel.app',
          'dripperz-production.vercel.app',
          'dripperz-production-immutable.vercel.app',
          'dpl-candidate.vercel.app',
          'dpl-recovery.vercel.app',
          'dpl-prior.vercel.app',
        ].includes(url.hostname)
      ) {
        if (scenario === 'smoke-failure')
          return new Response('Unavailable', { status: 503 });
        const hostedIdentity =
          url.hostname === 'dpl-candidate.vercel.app' ||
          (production && url.hostname === 'dripperz-dev.vercel.app')
            ? candidateIdentity
            : url.hostname === 'dpl-recovery.vercel.app'
              ? recoveryIdentity
              : url.hostname === 'dpl-prior.vercel.app'
                ? priorIdentity
                : identity;
        return new Response(
          url.pathname === '/delivery.json'
            ? JSON.stringify(hostedIdentity)
            : url.pathname === '/robots.txt'
              ? 'User-agent: *\nDisallow: /\n'
              : '<div id="root"></div>',
          {
            status: 200,
            headers: {
              'X-Robots-Tag': 'noindex, nofollow',
              'Cache-Control': 'no-store',
            },
          },
        );
      } else throw new Error('Network is disabled in controller tests');
      return Response.json(result);
    };
    await run({ requests, directory, identity });
  } finally {
    globalThis.fetch = originalFetch;
    process.chdir(originalCwd);
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(directory, { recursive: true, force: true });
  }
}

test('controller selects trusted successful main push CI with built-in authentication and no administration endpoints', async () => {
  await withController('success', async ({ directory }) => {
    await select();
    assert.match(
      await readFile(join(directory, 'output.txt'), 'utf8'),
      /target=dev/,
    );
    const event = JSON.parse(
      await readFile(join(directory, 'event.json'), 'utf8'),
    );
    for (const [key, value] of [
      ['event', 'pull_request'],
      ['conclusion', 'failure'],
      ['head_branch', 'feature'],
      ['head_repository', { full_name: 'someone/Dripperz' }],
    ]) {
      const invalid = structuredClone(event);
      invalid.workflow_run[key] = value;
      await writeFile(join(directory, 'event.json'), JSON.stringify(invalid));
      await assert.rejects(select);
    }
  });
});

test('controller rejects stale automatic, unmerged, drifted, tampered and disabled deliveries before POST', async () => {
  for (const scenario of [
    'superseded',
    'unmerged',
    'drift',
    'tampered',
    'disabled',
    'missing-config',
    'missing-github',
    'production-disabled',
  ]) {
    await withController(scenario, async ({ requests }) => {
      if (scenario === 'tampered')
        await writeFile('dist/index.html', 'tampered');
      if (scenario === 'disabled') process.env.DELIVERY_ENABLED = 'false';
      if (scenario === 'missing-config')
        delete process.env.VERCEL_DEV_PROJECT_ID;
      if (scenario === 'missing-github') delete process.env.GH_TOKEN;
      if (scenario === 'production-disabled') {
        process.env.DELIVERY_TARGET = 'production';
        const identity = JSON.parse(
          await readFile('dist/delivery.json', 'utf8'),
        );
        identity.target = 'production';
        await writeFile('dist/delivery.json', JSON.stringify(identity));
      }
      const expected = {
        superseded: /superseded/,
        unmerged: /not an ancestor/,
        drift: /static project settings/,
        tampered: /bundle identity or content mismatch/,
        disabled: /Delivery remains disabled/,
        'missing-config': /Missing VERCEL_DEV_PROJECT_ID/,
        'missing-github': /Missing GH_TOKEN/,
        'production-disabled': /Production remains disabled/,
      };
      await assert.rejects(deploy, expected[scenario]);
      assert.equal(
        requests.filter((request) => request.method === 'POST').length,
        0,
        scenario,
      );
    });
  }
});

test('successful controller uses one POST and retains exact immutable and prior identity', async () => {
  await withController('success', async ({ requests, directory, identity }) => {
    await deploy();
    assert.equal(
      requests.filter((request) => request.method === 'POST').length,
      1,
    );
    const record = JSON.parse(
      await readFile(join(directory, 'delivery-record.json'), 'utf8'),
    );
    assert.equal(record.deploymentId, 'dpl_created');
    assert.equal(record.priorDeploymentId, null);
    assert.equal(record.revision, identity.revision);
    assert.equal(record.status, 'smoke-verified-not-user-accepted');
    const payload = requests.find((request) => request.method === 'POST').body;
    assert.equal(payload.name, 'dripperz-dev');
    assert.equal(payload.project, 'prj_dev');
    assert.equal(payload.target, 'production');
    assert.deepEqual(payload.projectSettings, {
      framework: null,
      buildCommand: '',
      installCommand: '',
      outputDirectory: '.',
      rootDirectory: null,
      nodeVersion: '24.x',
    });
    assert.deepEqual(
      payload.files.map((file) => file.file),
      ['delivery.json', 'index.html', 'robots.txt', 'vercel.json'],
    );
    assert.ok(payload.files.every((file) => file.encoding === 'base64'));
    const config = JSON.parse(
      Buffer.from(
        payload.files.find((file) => file.file === 'vercel.json').data,
        'base64',
      ).toString(),
    );
    assert.deepEqual(config, {
      version: 2,
      framework: null,
      buildCommand: '',
      installCommand: '',
      outputDirectory: '.',
      headers: [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
            { key: 'Cache-Control', value: 'no-store' },
          ],
        },
      ],
    });
    assert.equal(
      Buffer.from(
        payload.files.find((file) => file.file === 'robots.txt').data,
        'base64',
      ).toString(),
      'User-agent: *\nDisallow: /\n',
    );
  });
});

test('actual production controller validates restored candidate and recovery before its single POST', async () => {
  await withController(
    'production-success',
    async ({ requests, directory }) => {
      await deploy();
      const mutations = requests.filter((request) => request.method === 'POST');
      assert.equal(mutations.length, 1);
      assert.equal(mutations[0].body.project, 'prj_production');
      const record = JSON.parse(
        await readFile(join(directory, 'delivery-record.json'), 'utf8'),
      );
      assert.equal(record.priorDeploymentId, 'dpl_prior');
      assert.equal(record.acceptedDevDeploymentId, 'dpl_candidate');
      assert.equal(record.promotion.acceptance.reviewer, 'benhammoush');
    },
  );
});

test('production controller rejects stale acceptance/recovery, run identity, empty production, late drift and missing dev credentials before POST', async () => {
  for (const scenario of [
    'production-candidate-drift',
    'production-recovery-mismatch',
    'production-prior-mismatch',
    'production-early-acceptance',
    'production-run-mismatch',
    'production-empty',
    'production-late-dev-drift',
    'production-missing-dev-credential',
  ]) {
    await withController(scenario, async ({ requests }) => {
      if (scenario === 'production-missing-dev-credential')
        delete process.env.VERCEL_DEV_VERIFICATION_TOKEN;
      const expected = {
        'production-candidate-drift': /recovery or configuration drifted/,
        'production-recovery-mismatch': /recorded READY/,
        'production-prior-mismatch': /recorded READY/,
        'production-early-acceptance': /Acceptance predates/,
        'production-run-mismatch': /Hosted identity differs/,
        'production-empty': /recovery or configuration drifted/,
        'production-late-dev-drift': /Dev acceptance invalidated/,
        'production-missing-dev-credential':
          /Missing VERCEL_DEV_VERIFICATION_TOKEN/,
      };
      await assert.rejects(deploy, expected[scenario]);
      assert.equal(
        requests.filter((request) => request.method === 'POST').length,
        0,
        scenario,
      );
    });
  }
});

test('ambiguous mutation and failed smoke never trigger retries or automatic rollback', async () => {
  for (const scenario of ['ambiguous-post', 'smoke-failure']) {
    await withController(scenario, async ({ requests, directory }) => {
      await assert.rejects(deploy);
      assert.equal(
        requests.filter((request) => request.method === 'POST').length,
        1,
      );
      const record = JSON.parse(
        await readFile(join(directory, 'delivery-record.json'), 'utf8'),
      );
      assert.equal(
        record.status,
        scenario === 'ambiguous-post'
          ? 'mutation-requested'
          : 'verification-pending',
      );
    });
  }
});

/**
 * Create independent synthetic static-project readback for mutation-negative tests.
 * @returns Valid project and domain fixtures.
 */
function staticProject() {
  return {
    project: {
      id: 'prj_dev',
      accountId: 'team_test',
      name: 'dripperz-dev',
      env: [],
      link: null,
      framework: null,
      buildCommand: '',
      installCommand: '',
      outputDirectory: '.',
      rootDirectory: null,
      nodeVersion: '24.x',
    },
    domains: { domains: [{ name: 'dripperz-dev.vercel.app' }] },
  };
}

/**
 * Apply the agreed dev project contract to a test fixture.
 * @param fixture - Independent project/domain response pair.
 * @returns Configuration fingerprint or a fail-closed error.
 */
function checkProject(fixture) {
  return projectConfiguration(
    fixture.project,
    fixture.domains,
    'dev',
    'team_test',
    'prj_dev',
  );
}

/**
 * Build the exact owner-reviewed production environment fixture.
 * @returns Environment protection and branch-policy pair.
 */
function gate() {
  return {
    environment: {
      name: 'production',
      can_admins_bypass: false,
      protection_rules: [
        {
          type: 'required_reviewers',
          prevent_self_review: false,
          reviewers: [{ reviewer: { login: 'benhammoush' } }],
        },
      ],
      deployment_branch_policy: {
        custom_branch_policies: true,
        protected_branches: false,
      },
    },
    policies: {
      total_count: 1,
      branch_policies: [{ name: 'main', type: 'branch' }],
    },
  };
}

test('only full source SHAs and agreed isolated targets are accepted', () => {
  assert.equal(sourceRevision('a'.repeat(40)), 'a'.repeat(40));
  for (const revision of [
    'main',
    'a'.repeat(39),
    'A'.repeat(40),
    '',
    undefined,
    'a'.repeat(40) + '\n',
  ]) {
    assert.throws(() => sourceRevision(revision));
  }
  assert.equal(projectName('dev'), 'dripperz-dev');
  assert.equal(projectName('production'), 'dripperz-production');
  for (const target of ['staging', '', 'prod', undefined])
    assert.throws(() => projectName(target));
});

test('configuration hashing ignores object key order, not values or array order', () => {
  assert.equal(fingerprint({ a: 1, b: 2 }), fingerprint({ b: 2, a: 1 }));
  assert.notEqual(fingerprint([1, 2]), fingerprint([2, 1]));
  assert.notEqual(fingerprint({ a: 1 }), fingerprint({ a: 2 }));
});

test('dedicated project settings, no secrets, no Git triggers and exact domain are required', () => {
  assert.match(checkProject(staticProject()), /^[a-f0-9]{64}$/);
  for (const [key, value] of [
    ['id', 'prj_other'],
    ['accountId', 'team_other'],
    ['name', 'dripperz-production'],
    ['env', undefined],
    ['env', [{ key: 'SECRET' }]],
    ['link', { type: 'github' }],
    ['framework', 'vite'],
    ['buildCommand', null],
    ['installCommand', 'npm ci'],
    ['outputDirectory', 'dist'],
    ['rootDirectory', 'elsewhere'],
    ['nodeVersion', '22.x'],
  ]) {
    const fixture = staticProject();
    fixture.project[key] = value;
    assert.throws(() => checkProject(fixture), key);
  }
  for (const domains of [
    [],
    [{ name: 'other.vercel.app' }],
    [{ name: 'dripperz-dev.vercel.app', redirect: 'other.example' }],
    [{ name: 'dripperz-dev.vercel.app' }, { name: 'legacy.example' }],
  ]) {
    const fixture = staticProject();
    fixture.domains.domains = domains;
    assert.throws(() => checkProject(fixture));
  }
  const fixture = staticProject();
  const before = checkProject(fixture);
  fixture.project.passwordProtection = { deploymentType: 'all' };
  assert.notEqual(checkProject(fixture), before);
});

test('setup validator requires native owner approval, no bypass and main-only branches', () => {
  const valid = gate();
  assert.doesNotThrow(() =>
    assertProductionGate(valid.environment, valid.policies),
  );
  for (const property of [
    'can_admins_bypass',
    'protection_rules',
    'deployment_branch_policy',
  ]) {
    const fixture = gate();
    delete fixture.environment[property];
    assert.throws(() =>
      assertProductionGate(fixture.environment, fixture.policies),
    );
  }
  const bypass = gate();
  bypass.environment.can_admins_bypass = true;
  assert.throws(() =>
    assertProductionGate(bypass.environment, bypass.policies),
  );
  const selfReview = gate();
  selfReview.environment.protection_rules[0].prevent_self_review = true;
  assert.throws(() =>
    assertProductionGate(selfReview.environment, selfReview.policies),
  );
  const reviewer = gate();
  reviewer.environment.protection_rules[0].reviewers[0].reviewer.login =
    'someone-else';
  assert.throws(() =>
    assertProductionGate(reviewer.environment, reviewer.policies),
  );
  for (const policy of [
    { name: '*', type: 'branch' },
    { name: 'main', type: 'tag' },
  ]) {
    const fixture = gate();
    fixture.policies.branch_policies = [policy];
    assert.throws(() =>
      assertProductionGate(fixture.environment, fixture.policies),
    );
  }
});

test('setup validator requires trusted branch checks and enforcement', () => {
  const protection = {
    required_status_checks: {
      strict: true,
      checks: [
        { context: 'Quality and build', app_id: 15368 },
        { context: 'Browser smoke', app_id: 15368 },
      ],
    },
    enforce_admins: { enabled: true },
    allow_force_pushes: { enabled: false },
    allow_deletions: { enabled: false },
  };
  assert.doesNotThrow(() => assertMainProtection(protection));
  for (const key of Object.keys(protection)) {
    const invalid = structuredClone(protection);
    delete invalid[key];
    assert.throws(() => assertMainProtection(invalid));
  }
  protection.required_status_checks.checks[0].app_id = 1;
  assert.throws(() => assertMainProtection(protection));
});

test('provider READY state must match project, target, source, version and both digests', () => {
  const record = {
    deploymentId: 'dpl_test',
    revision: 'a'.repeat(40),
    version: '0.1.0',
    bundleDigest: 'bundle',
    configDigest: 'config',
  };
  const deployment = {
    id: 'dpl_test',
    projectId: 'prj_dev',
    target: 'production',
    readyState: 'READY',
    meta: { ...record },
  };
  assert.doesNotThrow(() => assertDeployment(deployment, record, 'prj_dev'));
  for (const key of ['id', 'projectId', 'target', 'readyState']) {
    assert.throws(() =>
      assertDeployment({ ...deployment, [key]: 'wrong' }, record, 'prj_dev'),
    );
  }
  for (const key of ['revision', 'version', 'bundleDigest', 'configDigest']) {
    assert.throws(() =>
      assertDeployment(
        { ...deployment, meta: { ...deployment.meta, [key]: 'wrong' } },
        record,
        'prj_dev',
      ),
    );
  }
});

test('promotion requires exact rebuilt candidate, explicit acceptance and both recovery records', () => {
  const identity = {
    revision: 'a'.repeat(40),
    version: '0.1.0',
    bundleDigest: 'bundle',
  };
  const evidence = {
    candidate: { ...identity, deploymentId: 'dpl_candidate' },
    acceptance: {
      reviewer: 'benhammoush',
      at: '2026-01-01T00:00:00Z',
      runUrl: 'https://github.com/benhammoush/Dripperz/actions/runs/123',
    },
    recovery: {
      devDeploymentId: 'dpl_recovery',
      restoredCandidateDeploymentId: 'dpl_candidate',
      rehearsalRunUrl:
        'https://github.com/benhammoush/Dripperz/actions/runs/122',
    },
    production: { deploymentId: 'dpl_previous' },
  };
  assert.equal(promotionEvidence(evidence, identity), evidence);
  for (const key of ['candidate', 'acceptance', 'recovery', 'production']) {
    const invalid = structuredClone(evidence);
    delete invalid[key];
    assert.throws(() => promotionEvidence(invalid, identity));
  }
  assert.throws(() =>
    promotionEvidence(evidence, { ...identity, bundleDigest: 'changed' }),
  );
  const notRehearsed = structuredClone(evidence);
  notRehearsed.recovery.devDeploymentId = 'dpl_candidate';
  assert.throws(() => promotionEvidence(notRehearsed, identity));
  const future = structuredClone(evidence);
  future.acceptance.at = '2999-01-01T00:00:00Z';
  assert.throws(() => promotionEvidence(future, identity));
});
