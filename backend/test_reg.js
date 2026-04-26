import axios from 'axios';

const testRegistration = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: "Damarla Chandu",
      email: "damarlachandu4@gmail.com",
      password: "password123",
      role: "citizen",
      phone: "+91 7416359376",
      address: "Mangalagiri"
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

testRegistration();
