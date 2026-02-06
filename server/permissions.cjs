const url = require('url');

function getDb(req) {
  return req.app?.db || req.app?.get?.('db') || req.app?.router?.db || null;
}

function getUserById(db, userId) {
  if (!db || userId == null) return null;
  return db.get('users').find({ id: Number(userId) }).value() || null;
}

function getProjectById(db, projectId) {
  if (!db || projectId == null) return null;
  return db.get('projects').find({ id: Number(projectId) }).value() || null;
}

function isProjectMember(db, userId, projectId) {
  if (!db || userId == null || projectId == null) return false;
  const project = getProjectById(db, projectId);
  if (!project) return false;
  if (String(project.userId) === String(userId)) return true;
  const members = db
    .get('project_members')
    .filter({ projectId: Number(projectId) })
    .value();
  return members.some((m) => String(m.userId) === String(userId));
}

function parseResource(req) {
  const pathname = url.parse(req.originalUrl || req.url || '').pathname || '';
  const parts = pathname.split('/').filter(Boolean);
  const resource = parts[0] || null;
  const id = parts[1] || null;
  return { resource, id };
}

function filterProjectsForUser(db, userId) {
  const projects = db.get('projects').value() || [];
  const members = db.get('project_members').value() || [];
  const memberProjectIds = new Set(
    members
      .filter((m) => String(m.userId) === String(userId))
      .map((m) => Number(m.projectId))
  );
  return projects.filter(
    (p) => String(p.userId) === String(userId) || memberProjectIds.has(Number(p.id))
  );
}

function filterTasksForUser(db, userId) {
  const tasks = db.get('tasks').value() || [];
  return tasks.filter(
    (t) =>
      String(t.userId) === String(userId) &&
      isProjectMember(db, userId, t.projectId)
  );
}

function filterLogworksForUser(db, userId) {
  const logworks = db.get('logworks').value() || [];
  const allowedTasks = new Set(
    filterTasksForUser(db, userId).map((t) => Number(t.id))
  );
  return logworks.filter((lw) => allowedTasks.has(Number(lw.taskId)));
}

module.exports = (req, res, next) => {
  const { resource, id } = parseResource(req);

  if (!resource) return next();

  const protectedResources = new Set([
    'projects',
    'tasks',
    'logworks',
    'project_members',
  ]);

  if (!protectedResources.has(resource)) return next();

  const db = getDb(req);
  const userId = req.claims?.sub;

  if (!userId || !db) return next();

  const user = getUserById(db, userId);
  if (!user) return res.status(401).jsonp('Invalid user');

  const isLeader = user.role === 'leader';
  if (isLeader) return next();

  // Projects
  if (resource === 'projects') {
    if (req.method === 'GET' && !id) {
      return res.jsonp(filterProjectsForUser(db, userId));
    }

    const projectId = id || req.body?.id || req.body?.projectId;
    if (!isProjectMember(db, userId, projectId)) {
      return res.status(403).jsonp('Bạn không có quyền truy cập dự án này');
    }
    return next();
  }

  // Tasks
  if (resource === 'tasks') {
    if (req.method === 'GET' && !id) {
      return res.jsonp(filterTasksForUser(db, userId));
    }

    const task = id
      ? db.get('tasks').find({ id: Number(id) }).value()
      : req.body;

    if (!task) return res.status(404).jsonp('Task không tồn tại');

    const isOwnerTask = String(task.userId) === String(userId);
    const canAccessProject = isProjectMember(db, userId, task.projectId);

    if (!isOwnerTask || !canAccessProject) {
      return res.status(403).jsonp('Bạn không có quyền truy cập task này');
    }

    return next();
  }

  // Logworks
  if (resource === 'logworks') {
    if (req.method === 'GET' && !id) {
      return res.jsonp(filterLogworksForUser(db, userId));
    }

    const logwork = id
      ? db.get('logworks').find({ id: Number(id) }).value()
      : req.body;

    if (!logwork) return res.status(404).jsonp('Logwork không tồn tại');

    const task = db.get('tasks').find({ id: Number(logwork.taskId) }).value();
    if (!task) return res.status(404).jsonp('Task không tồn tại');

    const isOwnerTask = String(task.userId) === String(userId);
    const canAccessProject = isProjectMember(db, userId, task.projectId);

    if (!isOwnerTask || !canAccessProject) {
      return res.status(403).jsonp('Bạn không có quyền truy cập logwork này');
    }

    return next();
  }

  // Project Members
  if (resource === 'project_members') {
    if (req.method === 'GET' && !id) {
      const members = db.get('project_members').value() || [];
      const allowedProjectIds = new Set(
        filterProjectsForUser(db, userId).map((p) => Number(p.id))
      );
      const filtered = members.filter((m) =>
        allowedProjectIds.has(Number(m.projectId))
      );
      return res.jsonp(filtered);
    }

    const memberRow = id
      ? db.get('project_members').find({ id: Number(id) }).value()
      : req.body;

    const projectId = memberRow?.projectId;
    const project = getProjectById(db, projectId);

    if (!project) return res.status(404).jsonp('Project không tồn tại');

    const isOwner = String(project.userId) === String(userId);
    if (!isOwner) {
      return res.status(403).jsonp('Bạn không có quyền quản lý thành viên dự án');
    }

    return next();
  }

  return next();
};
