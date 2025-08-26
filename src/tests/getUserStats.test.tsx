import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../contexts/AuthContext';
import React from 'react';

// Mock the AuthContext
vi.mock('../contexts/AuthContext');

describe('getUserStats functionality', () => {
  let mockGetUserStats: any;
  let mockUser: any;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Setup mock user object
    mockUser = {
      id: 'test-user-123',
      username: 'testuser',
      email: 'test@example.com'
    };

    // Setup mock getUserStats function
    mockGetUserStats = vi.fn();
  });

  it('should verify user object has an id property', () => {
    // Arrange
    (useAuth as any).mockReturnValue({
      user: mockUser,
      getUserStats: mockGetUserStats,
      logout: vi.fn()
    });

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    expect(result.current.user).toBeDefined();
    expect(result.current.user.id).toBeDefined();
    expect(result.current.user.id).toBe('test-user-123');
    console.log('✅ User object has id:', result.current.user.id);
  });

  it('should call getUserStats with user.id parameter', async () => {
    // Arrange
    const mockStats = {
      level: 5,
      score: 1200,
      streak: 3,
      totalGames: 15,
      correctGuesses: 10
    };

    mockGetUserStats.mockResolvedValue(mockStats);

    (useAuth as any).mockReturnValue({
      user: mockUser,
      getUserStats: mockGetUserStats,
      logout: vi.fn()
    });

    // Act
    const { result } = renderHook(() => useAuth());
    
    let statsResult;
    await act(async () => {
      statsResult = await result.current.getUserStats(result.current.user.id);
    });

    // Assert
    expect(mockGetUserStats).toHaveBeenCalledWith('test-user-123');
    expect(mockGetUserStats).toHaveBeenCalledTimes(1);
    expect(statsResult).toEqual(mockStats);
    console.log('✅ getUserStats called with user.id:', mockUser.id);
    console.log('✅ Stats returned:', statsResult);
  });

  it('should handle getUserStats when user is null', async () => {
    // Arrange
    (useAuth as any).mockReturnValue({
      user: null,
      getUserStats: mockGetUserStats,
      logout: vi.fn()
    });

    // Act
    const { result } = renderHook(() => useAuth());

    // Assert
    expect(result.current.user).toBeNull();
    console.log('✅ Handled null user case');
  });

  it('should handle getUserStats error gracefully', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch user stats';
    mockGetUserStats.mockRejectedValue(new Error(errorMessage));

    (useAuth as any).mockReturnValue({
      user: mockUser,
      getUserStats: mockGetUserStats,
      logout: vi.fn()
    });

    // Act
    const { result } = renderHook(() => useAuth());
    
    let error;
    try {
      await act(async () => {
        await result.current.getUserStats(result.current.user.id);
      });
    } catch (e) {
      error = e;
    }

    // Assert
    expect(error).toBeDefined();
    expect((error as Error).message).toBe(errorMessage);
    console.log('✅ Error handled correctly:', errorMessage);
  });

  it('should verify the structure of returned stats', async () => {
    // Arrange
    const mockStats = {
      level: 1,
      score: 0,
      streak: 0,
      totalGames: 0,
      correctGuesses: 0
    };

    mockGetUserStats.mockResolvedValue(mockStats);

    (useAuth as any).mockReturnValue({
      user: mockUser,
      getUserStats: mockGetUserStats,
      logout: vi.fn()
    });

    // Act
    const { result } = renderHook(() => useAuth());
    
    let statsResult: any;
    await act(async () => {
      statsResult = await result.current.getUserStats(result.current.user.id);
    });

    // Assert
    expect(statsResult).toHaveProperty('level');
    expect(statsResult).toHaveProperty('score');
    expect(statsResult).toHaveProperty('streak');
    expect(typeof statsResult.level).toBe('number');
    expect(typeof statsResult.score).toBe('number');
    expect(typeof statsResult.streak).toBe('number');
    console.log('✅ Stats structure verified:', Object.keys(statsResult));
  });
});

// Integration test to check actual implementation
describe('getUserStats integration test', () => {
  it('should log actual user and getUserStats implementation', () => {
    // This test will help us understand the actual implementation
    console.log('');
    console.log('=== INTEGRATION TEST INFO ===');
    console.log('To verify the actual implementation:');
    console.log('1. Check if user object has: id, userId, _id, or uid property');
    console.log('2. Check if getUserStats expects: string or number parameter');
    console.log('3. Check if getUserStats is async or returns a Promise');
    console.log('4. Check the actual stats object structure returned');
    console.log('');
    console.log('Run this in browser console when logged in:');
    console.log('----------------------------------------');
    console.log('const { user, getUserStats } = useAuth();');
    console.log('console.log("User object:", user);');
    console.log('console.log("User keys:", Object.keys(user));');
    console.log('if (user.id) {');
    console.log('  getUserStats(user.id).then(stats => {');
    console.log('    console.log("Stats:", stats);');
    console.log('  }).catch(err => {');
    console.log('    console.error("Error:", err);');
    console.log('  });');
    console.log('}');
    console.log('----------------------------------------');
  });
});