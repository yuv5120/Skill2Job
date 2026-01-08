import prisma from '../prisma';

describe('Database Operations', () => {
  beforeAll(async () => {
    // Setup test database
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Job CRUD Operations', () => {
    it('should create a new job', async () => {
      const newJob = {
        title: 'Test Job',
        description: 'Test Description',
        skills: ['JavaScript', 'Node.js'],
        postedBy: 'test-user-id'
      };

      const job = await prisma.job.create({
        data: newJob
      });

      expect(job).toHaveProperty('id');
      expect(job.title).toBe(newJob.title);
      expect(job.skills).toEqual(newJob.skills);

      // Cleanup
      await prisma.job.delete({ where: { id: job.id } });
    });

    it('should fetch all jobs', async () => {
      const jobs = await prisma.job.findMany();
      expect(Array.isArray(jobs)).toBe(true);
    });
  });

  describe('Resume Operations', () => {
    it('should create and retrieve resume', async () => {
      const resumeData = {
        userId: 'test-user-123',
        name: 'John Doe',
        email: 'john@example.com',
        skills: ['React', 'Node.js', 'TypeScript'],
        experience: 'Software Engineer at XYZ Company for 3 years'
      };

      const resume = await prisma.resume.create({
        data: resumeData
      });

      expect(resume).toHaveProperty('id');
      expect(resume.email).toBe(resumeData.email);

      // Cleanup
      await prisma.resume.delete({ where: { id: resume.id } });
    });
  });
});
