/**
 * Fail-closed, side-effect-free contracts shared by delivery controls and tests.
 * @file
 */

import { createHash } from 'node:crypto';

export const REPOSITORY = 'benhammoush/Dripperz';
export const OWNER = 'benhammoush';
export const TEAM = 'benhammoushs-projects';

/**
 * Describe source-free static hosting and conservative indexing/cache policy.
 * This root vercel.json travels in the REST deployment's inline files.
 * @returns Fresh Vercel project configuration for the tested static bundle.
 */
export function staticHostingConfiguration() {
  return {
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
  };
}

/**
 * Reject incomplete or contradictory delivery evidence without printing secrets.
 * @param condition - Condition that must hold.
 * @param message - Safe diagnostic identifying the failed contract.
 */
export function requireDelivery(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Validate an explicit full source identity; symbolic refs are never accepted.
 * @param revision - Requested source revision.
 * @returns The validated full SHA.
 */
export function sourceRevision(revision) {
  requireDelivery(
    typeof revision === 'string' &&
      revision.length === 40 &&
      /^[a-f0-9]{40}$/.test(revision),
    'Full source SHA required',
  );
  return revision;
}

/**
 * Resolve a target to its agreed isolated project, rejecting former staging use.
 * @param target - Delivery environment name.
 * @returns The agreed project name.
 */
export function projectName(target) {
  requireDelivery(['dev', 'production'].includes(target), 'Unknown target');
  return `dripperz-${target}`;
}

/**
 * Hash JSON-compatible public configuration with deterministic key ordering.
 * @param value - Public configuration or file manifest.
 * @returns SHA-256 fingerprint; never a substitute for manual configuration review.
 */
export function fingerprint(value) {
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex');
}

/**
 * Normalize object keys recursively while retaining meaningful array order.
 * @param value - JSON-compatible value.
 * @returns Canonical JSON-compatible data.
 */
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonical(value[key])]),
    );
  }
  return value;
}

/**
 * Validate operator setup readback, not runtime controller policy enforcement.
 * Require actual main protection, not merely successful CI or YAML declarations.
 * This preserves the existing solo-maintainer policy rather than inventing reviews.
 * @param protection - GitHub branch-protection readback.
 */
export function assertMainProtection(protection) {
  const checks = protection.required_status_checks;
  requireDelivery(
    checks?.strict === true &&
      ['Quality and build', 'Browser smoke'].every((name) =>
        checks.checks?.some(
          (check) => check.context === name && check.app_id === 15368,
        ),
      ) &&
      protection.enforce_admins?.enabled === true &&
      protection.allow_force_pushes?.enabled === false &&
      protection.allow_deletions?.enabled === false,
    'Main protection is missing or weaker than the recorded foundation',
  );
}

/**
 * Validate native approval and main-only policy in operator setup readback.
 * @param environment - Actual GitHub environment readback.
 * @param policies - Actual custom deployment branch policies.
 */
export function assertProductionGate(environment, policies) {
  assertEnvironmentBranchPolicy(environment, policies, 'production');
  const reviewers = environment.protection_rules?.find(
    (rule) => rule.type === 'required_reviewers',
  );
  requireDelivery(
    environment.can_admins_bypass === false &&
      reviewers?.prevent_self_review === false &&
      reviewers.reviewers?.length === 1 &&
      reviewers.reviewers[0].reviewer?.login === OWNER,
    'Production needs owner approval, no admin bypass, and main-only branch policy',
  );
}

/**
 * Validate main-only native environment policy during operator setup readback,
 * protecting credentials from a different branch's modified workflow when enforced.
 * @param environment - Actual GitHub environment readback.
 * @param policies - Actual custom deployment branch policies.
 * @param target - Agreed delivery environment.
 */
export function assertEnvironmentBranchPolicy(environment, policies, target) {
  projectName(target);
  requireDelivery(
    environment.name === target &&
      environment.deployment_branch_policy?.custom_branch_policies === true &&
      environment.deployment_branch_policy?.protected_branches === false &&
      policies.total_count === 1 &&
      policies.branch_policies?.length === 1 &&
      policies.branch_policies[0].name === 'main' &&
      policies.branch_policies[0].type === 'branch',
    'Native main-only environment branch policy required',
  );
}

/**
 * Verify a dedicated static project, with Git triggers disconnected and no runtime
 * secrets or custom domains. Return a bounded public configuration fingerprint.
 * @param project - Vercel project readback.
 * @param domains - Project domain readback.
 * @param target - Agreed delivery target.
 * @param teamId - Explicit team identity supplied by setup.
 * @param projectId - Explicit isolated project identity supplied by setup.
 * @returns Public configuration fingerprint for candidate drift checks.
 */
export function projectConfiguration(
  project,
  domains,
  target,
  teamId,
  projectId,
) {
  const name = projectName(target);
  requireDelivery(
    project.id === projectId &&
      project.accountId === teamId &&
      project.name === name,
    'Provider project identity does not match configuration',
  );
  requireDelivery(!project.link, 'Disconnect competing Vercel Git integration');
  requireDelivery(
    Array.isArray(project.env) &&
      project.env.length === 0 &&
      project.framework === null &&
      project.buildCommand === '' &&
      project.installCommand === '' &&
      project.outputDirectory === '.' &&
      !project.rootDirectory &&
      project.nodeVersion === '24.x',
    'Dedicated static project settings or empty environment are unverified',
  );
  requireDelivery(
    domains.domains?.length === 1 &&
      domains.domains[0].name === `${name}.vercel.app` &&
      !domains.domains[0].redirect &&
      !domains.domains[0].gitBranch &&
      !domains.domains[0].customEnvironmentId,
    'Only the agreed default project domain is supported',
  );
  return fingerprint({
    id: project.id,
    accountId: project.accountId,
    name,
    env: [],
    framework: project.framework,
    buildCommand: project.buildCommand,
    installCommand: project.installCommand,
    outputDirectory: project.outputDirectory,
    rootDirectory: project.rootDirectory ?? null,
    nodeVersion: project.nodeVersion,
    link: null,
    domain: domains.domains[0].name,
    ssoProtection: project.ssoProtection ?? null,
    passwordProtection: project.passwordProtection ?? null,
    trustedIps: project.trustedIps ?? null,
  });
}

/**
 * Match immutable deployment identity to a reviewed source and build record.
 * @param deployment - Provider deployment readback.
 * @param record - Expected public delivery identity.
 * @param projectId - Expected project ID.
 */
export function assertDeployment(deployment, record, projectId) {
  requireDelivery(
    deployment.id === record.deploymentId &&
      deployment.projectId === projectId &&
      deployment.readyState === 'READY' &&
      deployment.target === 'production' &&
      ['revision', 'version', 'bundleDigest', 'configDigest'].every(
        (key) =>
          typeof record[key] === 'string' &&
          record[key] !== '' &&
          deployment.meta?.[key] === record[key],
      ),
    'Deployment is not the recorded READY source/build/configuration identity',
  );
}
