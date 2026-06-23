class Validator {
  validateRule(rule) {
    if (!rule.rule || typeof rule.rule !== 'string') return false;
    if (rule.rule.length < 2) return false;
    if (/\s/.test(rule.rule.trim())) return false;
    return true;
  }

  validateDomain(domain) {
    if (!domain) return false;
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain) || domainRegex.test(domain.replace(/^\*\./, ''));
  }

  validateRules(rules) {
    const valid = [];
    const invalid = [];
    let domainOnlyRules = 0;

    for (const rule of rules) {
      if (this.validateRule(rule)) {
        valid.push(rule);
        if (rule.domain) domainOnlyRules++;
      } else {
        invalid.push(rule);
      }
    }

    return {
      valid,
      invalid,
      stats: {
        total: rules.length,
        valid: valid.length,
        invalid: invalid.length,
        withDomain: domainOnlyRules,
        withoutDomain: valid.length - domainOnlyRules,
      },
    };
  }

  isPotentiallyDangerous(rule) {
    const dangerousPatterns = [
      /^\/\//, /^https?:\/\/localhost/i, /^https?:\/\/127\./,
      /^https?:\/\/10\./, /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./,
      /^https?:\/\/192\.168\./, /^https?:\/\/0\.0\.0\.0/,
    ];
    return dangerousPatterns.some(p => p.test(rule.rule));
  }
}

module.exports = Validator;
