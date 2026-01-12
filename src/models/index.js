/**
 * @typedef {'leader' | 'staff'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} email
 * @property {string} name
 * @property {UserRole} role - 'leader' hoặc 'staff'
 * @property {string} [password] - Only for creation, not in responses
 * @property {boolean} [approved] - Trạng thái duyệt tài khoản (mặc định false - chờ duyệt)
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} accessToken
 * @property {User} user
 */

/**
 * @typedef {Object} Project
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {"PLANNING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"} status
 * @property {number} userId
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {"todo" | "in-progress" | "done"} status
 * @property {number} projectId
 * @property {number} userId
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Logwork
 * @property {number} id
 * @property {number} taskId
 * @property {number} userId
 * @property {number} hours
 * @property {string} description
 * @property {string} date
 * @property {string} createdAt
 */

/**
 * @typedef {Object} ProjectMember
 * @property {number} id
 * @property {number} projectId
 * @property {number} userId
 * @property {'owner' | 'member'} role
 * @property {string} createdAt
 */

// Export empty objects for named imports (for compatibility)
export const UserRole = {};
export const User = {};
export const LoginCredentials = {};
export const AuthResponse = {};
export const Project = {};
export const Task = {};
export const Logwork = {};
export const ProjectMember = {};
