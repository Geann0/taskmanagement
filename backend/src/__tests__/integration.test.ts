import request from 'supertest';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import authRoutes from '../routes/auth';
import projectRoutes from '../routes/projects';
import boardRoutes from '../routes/boards';
import columnRoutes from '../routes/columns';
import cardRoutes from '../routes/cards';
import memberRoutes from '../routes/members';
import { authenticateJWT } from '../middleware/auth';
import { User } from '../models/User';
import { Project } from '../models/Project';

let app: Express;
let mongoServer: MongoMemoryServer;
let testToken: string;
let testUserId: string;
let testProjectId: string;

beforeAll(async () => {
  // Setup in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Setup Express app
  app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use('/projects', authenticateJWT, projectRoutes);
  app.use('/projects/:projectId/boards', authenticateJWT, boardRoutes);
  app.use('/projects/:projectId/boards/:boardId/columns', authenticateJWT, columnRoutes);
  app.use(
    '/projects/:projectId/boards/:boardId/columns/:columnId/cards',
    authenticateJWT,
    cardRoutes
  );
  app.use('/projects/:projectId/boards/:boardId/cards', authenticateJWT, cardRoutes);
  app.use('/projects/:projectId/members', authenticateJWT, memberRoutes);

  // Create test user
  const user = await User.create({
    email: 'test@example.com',
    name: 'Test User',
    googleId: 'test-google-id',
  });
  testUserId = user._id.toString();

  // Generate test token using same JWT_SECRET as production
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  testToken = jwt.sign({ userId: testUserId }, JWT_SECRET);

  // Create test project
  const project = await Project.create({
    name: 'Test Project',
    description: 'Test Description',
    visibility: 'private',
    members: [{ userId: user._id, role: 'owner', joinedAt: new Date() }],
    boards: [],
  });
  testProjectId = project._id.toString();
}, 60000); // Increase timeout to 60 seconds

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
}, 60000);

describe('Projects API', () => {
  it('should get all projects for authenticated user', async () => {
    const response = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should create a new project', async () => {
    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        name: 'New Project',
        description: 'New Description',
        visibility: 'private',
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('New Project');
    expect(response.body.members).toHaveLength(1);
    expect(response.body.members[0].role).toBe('owner');
  });

  it('should get a specific project', async () => {
    const response = await request(app)
      .get(`/projects/${testProjectId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(testProjectId);
  });

  it('should return 401 without authentication', async () => {
    const response = await request(app).get('/projects');
    expect(response.status).toBe(401);
  });
});

describe('Boards API', () => {
  it('should create a new board', async () => {
    const response = await request(app)
      .post(`/projects/${testProjectId}/boards`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Test Board' });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test Board');
  });

  it('should get all boards in a project', async () => {
    const response = await request(app)
      .get(`/projects/${testProjectId}/boards`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should return 400 when board name is missing', async () => {
    const response = await request(app)
      .post(`/projects/${testProjectId}/boards`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });
});

describe('Permissions API', () => {
  let viewerToken: string;
  let viewerUserId: string;

  beforeAll(async () => {
    // Create viewer user
    const viewer = await User.create({
      email: 'viewer@example.com',
      name: 'Viewer User',
      googleId: 'viewer-google-id',
    });
    viewerUserId = viewer._id.toString();
    viewerToken = jwt.sign({ userId: viewerUserId }, process.env.JWT_SECRET || 'test-secret');

    // Add viewer to project
    await Project.findByIdAndUpdate(testProjectId, {
      $push: {
        members: { userId: viewer._id, role: 'viewer', joinedAt: new Date() },
      },
    });
  });

  it('should allow owner to create board', async () => {
    const response = await request(app)
      .post(`/projects/${testProjectId}/boards`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Owner Board' });

    expect(response.status).toBe(201);
  });

  it('should deny viewer from creating board', async () => {
    const response = await request(app)
      .post(`/projects/${testProjectId}/boards`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'Viewer Board' });

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('permission');
  });

  it('should allow viewer to get boards', async () => {
    const response = await request(app)
      .get(`/projects/${testProjectId}/boards`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(response.status).toBe(200);
  });
});

describe('Members API', () => {
  it('should add a new member to project', async () => {
    const newUser = await User.create({
      email: 'newmember@example.com',
      name: 'New Member',
      googleId: 'new-member-id',
    });

    const response = await request(app)
      .post(`/projects/${testProjectId}/members`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        email: 'newmember@example.com',
        role: 'editor',
      });

    expect(response.status).toBe(201);
    expect(response.body).toBeInstanceOf(Array);
    const addedMember = response.body.find((m: any) => m.userId._id === newUser._id.toString());
    expect(addedMember).toBeDefined();
    expect(addedMember.role).toBe('editor');
  });

  it('should update member role', async () => {
    const project = await Project.findById(testProjectId);
    const memberToUpdate = project!.members.find((m) => m.role === 'editor');

    const response = await request(app)
      .patch(`/projects/${testProjectId}/members/${memberToUpdate!.userId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ role: 'admin' });

    expect(response.status).toBe(200);
    const updatedMember = response.body.find(
      (m: any) => m.userId._id === memberToUpdate!.userId.toString()
    );
    expect(updatedMember.role).toBe('admin');
  });

  it('should remove a member from project', async () => {
    const project = await Project.findById(testProjectId);
    const memberToRemove = project!.members.find((m) => m.role === 'admin');

    const response = await request(app)
      .delete(`/projects/${testProjectId}/members/${memberToRemove!.userId}`)
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('removed');
  });
});

describe('Cards API - Move Operation', () => {
  let boardId: string;
  let column1Id: string;
  let column2Id: string;
  let cardId: string;

  beforeAll(async () => {
    // Create board
    const boardRes = await request(app)
      .post(`/projects/${testProjectId}/boards`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Move Test Board' });
    boardId = boardRes.body._id;

    // Create columns
    const col1Res = await request(app)
      .post(`/projects/${testProjectId}/boards/${boardId}/columns`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Column 1', order: 0 });
    column1Id = col1Res.body._id;

    const col2Res = await request(app)
      .post(`/projects/${testProjectId}/boards/${boardId}/columns`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ name: 'Column 2', order: 1 });
    column2Id = col2Res.body._id;

    // Create card
    const cardRes = await request(app)
      .post(`/projects/${testProjectId}/boards/${boardId}/columns/${column1Id}/cards`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({ title: 'Test Card', description: 'Test Description', order: 0 });
    cardId = cardRes.body._id;
  });

  it('should move card between columns', async () => {
    const response = await request(app)
      .put(`/projects/${testProjectId}/boards/${boardId}/cards/${cardId}/move`)
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        sourceColumnId: column1Id,
        targetColumnId: column2Id,
        newOrder: 0,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('moved');
  });
});
