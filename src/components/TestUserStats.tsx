import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestUserStats = () => {
  const { user, getUserStats } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>({});

  useEffect(() => {
    if (user) {
      // Store user info for display
      setUserInfo({
        hasId: 'id' in user,
        hasUserId: 'userId' in user,
        hasUid: 'uid' in user,
        has_id: '_id' in user,
        username: user.username,
        properties: Object.keys(user).join(', ')
      });
    }
  }, [user]);

  const testGetUserStats = async () => {
    if (!user) {
      setError('No user logged in');
      return;
    }

    setLoading(true);
    setError(null);
    setStats(null);

    // Try different approaches
    const attempts = [];
    
    // Attempt 1: Try with user.id
    if ('id' in user) {
      try {
        const result = await getUserStats((user as any).id);
        setStats(result);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Failed with user.id:', err);
        attempts.push(`user.id (${(user as any).id}): ${err}`);
      }
    }

    // Attempt 2: Try with username
    if (user.username) {
      try {
        const result = await getUserStats(user.username);
        setStats(result);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Failed with username:', err);
        attempts.push(`username (${user.username}): ${err}`);
      }
    }

    // Attempt 3: Try with any numeric/string property that looks like an ID
    for (const [key, value] of Object.entries(user)) {
      if ((key.toLowerCase().includes('id') || key === 'uid' || key === '_id') && value) {
        try {
          const result = await getUserStats(value as any);
          setStats(result);
          setLoading(false);
          return;
        } catch (err) {
          console.error(`Failed with ${key}:`, err);
          attempts.push(`${key} (${value}): ${err}`);
        }
      }
    }

    // If all attempts failed
    setError(`All attempts failed:\n${attempts.join('\n')}`);
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg m-4">
      <h2 className="text-2xl font-bold mb-4 text-white">User Stats Test Component</h2>
      
      {/* User Info Section */}
      <div className="mb-6 p-4 bg-gray-700 rounded">
        <h3 className="text-lg font-semibold mb-2 text-blue-400">User Object Info:</h3>
        {user ? (
          <div className="text-gray-300 space-y-1">
            <p>✓ User is logged in</p>
            <p>Username: {userInfo.username}</p>
            <p>Has 'id' property: {userInfo.hasId ? '✅' : '❌'}</p>
            <p>Has 'userId' property: {userInfo.hasUserId ? '✅' : '❌'}</p>
            <p>Has 'uid' property: {userInfo.hasUid ? '✅' : '❌'}</p>
            <p>Has '_id' property: {userInfo.has_id ? '✅' : '❌'}</p>
            <p>All properties: {userInfo.properties}</p>
          </div>
        ) : (
          <p className="text-red-400">No user logged in</p>
        )}
      </div>

      {/* Test Button */}
      <button
        onClick={testGetUserStats}
        disabled={!user || loading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed mb-4"
      >
        {loading ? 'Testing...' : 'Test getUserStats()'}
      </button>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-900 border border-red-700 rounded mb-4">
          <h3 className="text-red-400 font-semibold mb-2">Error:</h3>
          <pre className="text-red-300 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      {/* Stats Display */}
      {stats && (
        <div className="p-4 bg-green-900 border border-green-700 rounded">
          <h3 className="text-green-400 font-semibold mb-2">Success! Stats Retrieved:</h3>
          <pre className="text-green-300">{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-700 rounded">
        <h3 className="text-yellow-400 font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-gray-300 space-y-1">
          <li>Make sure you're logged in</li>
          <li>Click "Test getUserStats()" button</li>
          <li>Check the console for detailed logs</li>
          <li>The component will try different parameter options</li>
          <li>Success or error will be displayed above</li>
        </ol>
      </div>
    </div>
  );
};

export default TestUserStats;