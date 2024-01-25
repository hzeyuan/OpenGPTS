import { GPT } from './index';

describe('GPT', () => {
  let gpt: GPT;

  beforeEach(() => {
    gpt = new GPT('your-auth-token');
  });

  it('should throw an error if authentication token is missing', () => {
    gpt = new GPT(); // Create an instance without providing a token
    expect(() => gpt.list()).toThrowError('Authentication token is missing. Please log in.');
  });

  it('should fetch a list of gizmos', async () => {
    const gizmos = await gpt.list();
    expect(gizmos).toBeDefined();
    expect(gizmos.gpts).toBeInstanceOf(Array);
    expect(gizmos.cursor).toBeDefined();
  });

  it('should get a specific gizmo', async () => {
    const gizmoId = 'your-gizmo-id';
    const gizmo = await gpt.get(gizmoId);
    expect(gizmo).toBeDefined();
    expect(gizmo.gpt).toBeDefined();
    expect(gizmo.tools).toBeDefined();
  });

  it('should delete a gizmo', async () => {
    const gizmoId = 'your-gizmo-id';
    const result = await gpt.del(gizmoId);
    expect(result).toBe(true);
  });

  it('should update a gizmo', async () => {
    const gizmo = { id: 'your-gizmo-id', display: { name: 'New Name' } };
    const updatedGizmo = await gpt.update(gizmo);
    expect(updatedGizmo).toBeDefined();
    expect(updatedGizmo.id).toBe(gizmo.id);
    expect(updatedGizmo.display.name).toBe(gizmo.display.name);
  });

  it('should create a new gizmo', async () => {
    const gizmo = { display: { name: 'New Gizmo' }, instructions: 'Some instructions' };
    const tools = [{ type: 'dalle' }, { type: 'browser' }];
    const createdGizmo = await gpt.create(gizmo, tools);
    expect(createdGizmo).toBeDefined();
    expect(createdGizmo.id).toBeDefined();
    expect(createdGizmo.display.name).toBe(gizmo.display.name);
  });

  it('should publish a gizmo', async () => {
    const gizmoId = 'your-gizmo-id';
    const result = await gpt.publish(gizmoId);
    expect(result).toBe(true);
  });

  it('should chat', () => {
    // Write your chat test here
  });
});