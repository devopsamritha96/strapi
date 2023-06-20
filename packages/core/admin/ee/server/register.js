'use strict';

const { features } = require('@strapi/strapi/lib/utils/ee');
const executeCERegister = require('../../server/register');
const migrateAuditLogsTable = require('./migrations/audit-logs-table');
const migrateReviewWorkflowStagesColor = require('./migrations/review-workflows-stages-color');
const migrateReviewWorkflowName = require('./migrations/review-workflows-workflow-name');
const migrateWorkflowsContentTypes = require('./migrations/review-workflows-content-types');
const migrateStageAttribute = require('./migrations/review-workflows-stage-attribute');
const createAuditLogsService = require('./services/audit-logs');
const reviewWorkflowsMiddlewares = require('./middlewares/review-workflows');
const { getService } = require('./utils');

module.exports = async ({ strapi }) => {
  const auditLogsIsEnabled = strapi.config.get('admin.auditLogs.enabled', true);

  if (auditLogsIsEnabled) {
    strapi.hook('strapi::content-types.beforeSync').register(migrateAuditLogsTable);
    const auditLogsService = createAuditLogsService(strapi);
    strapi.container.register('audit-logs', auditLogsService);
    await auditLogsService.register();
  }
  if (features.isEnabled('review-workflows')) {
    strapi.hook('strapi::content-types.beforeSync').register(migrateStageAttribute);
    strapi.hook('strapi::content-types.afterSync').register(migrateReviewWorkflowStagesColor);
    strapi.hook('strapi::content-types.afterSync').register(migrateReviewWorkflowName);
    strapi.hook('strapi::content-types.afterSync').register(migrateWorkflowsContentTypes);
    const reviewWorkflowService = getService('review-workflows');

    reviewWorkflowsMiddlewares.contentTypeMiddleware(strapi);
    await reviewWorkflowService.register();
  }
  await executeCERegister({ strapi });
};
