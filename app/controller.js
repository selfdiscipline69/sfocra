import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const App = () => {
  // Save data
  const saveUser = async (user) => {
    try {
      const jsonValue = JSON.stringify(user);
      await AsyncStorage.setItem('user', jsonValue);
    } catch (e) {
      console.error('Error saving user:', e);
    }
  };

  // Get data
  const loadUser = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error loading user:', e);
    }
  };

  useEffect(() => {
    // Example usage
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    };
    
    saveUser(user);
    
    // Later, to retrieve
    loadUser().then(userData => {
      console.log(userData);
    });
  }, []);

  return (
    <div>
      {/* Your JSX */}
    </div>
  );
};

export default App;