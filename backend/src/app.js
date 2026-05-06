const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const swaggerDocument = require('./swagger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const childRoutes = require('./modules/children/children.routes');
const curriculumRoutes = require('./modules/curriculum/curriculum.routes');
const learningRoutes = require('./modules/learning/learning.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const leaderboardRoutes = require('./modules/gamification/leaderboard.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'literacy-api' }));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/children', childRoutes);
app.use('/api/v1', curriculumRoutes);
app.use('/api/v1', learningRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
