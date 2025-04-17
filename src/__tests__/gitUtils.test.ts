import { getGitUser } from '../utils/gitUtils';
import { exec } from 'child_process';

// Mock the child_process module
jest.mock('child_process', () => ({
  exec: jest.fn(),
}));

describe('Git Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGitUser', () => {
    it('should return git user name and email when git commands succeed', async () => {
      // Mock successful git config commands
      const mockExec = exec as jest.MockedFunction<typeof exec>;
      
      // Mock for git config user.name
      mockExec.mockImplementationOnce((command, callback) => {
        callback(null, { stdout: 'John Doe\n', stderr: '' });
        return {} as any;
      });
      
      // Mock for git config user.email
      mockExec.mockImplementationOnce((command, callback) => {
        callback(null, { stdout: 'john.doe@example.com\n', stderr: '' });
        return {} as any;
      });

      const result = await getGitUser();
      
      expect(result).toEqual({
        name: 'John Doe',
        email: 'john.doe@example.com',
      });
      
      expect(mockExec).toHaveBeenCalledTimes(2);
      expect(mockExec).toHaveBeenNthCalledWith(1, 'git config user.name', expect.any(Function));
      expect(mockExec).toHaveBeenNthCalledWith(2, 'git config user.email', expect.any(Function));
    });

    it('should return empty strings when git commands fail', async () => {
      // Mock failed git config command
      const mockExec = exec as jest.MockedFunction<typeof exec>;
      
      mockExec.mockImplementationOnce((command, callback) => {
        callback(new Error('git command failed'), { stdout: '', stderr: 'error' });
        return {} as any;
      });

      const result = await getGitUser();
      
      expect(result).toEqual({
        name: '',
        email: '',
      });
      
      // Only the first command is called and it fails
      expect(mockExec).toHaveBeenCalledTimes(1);
    });
  });
}); 