import { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-primary via-secondary to-orange-400 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Local Disaster Alert & Resource Coordination Platform
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100">
            Real-time disaster management connecting communities, volunteers, and resources
          </p>

          {!user ? (
            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-primary hover:bg-gray-100 border-white"
              >
                Get Started
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/login')}
                className="text-white border-white border-2"
              >
                Sign In
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="bg-white text-primary hover:bg-gray-100 border-white"
            >
              Go to Dashboard
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Key Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-8 text-center hover:shadow-lg transition">
              <div className="text-5xl mb-4">🚨</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Report Disasters</h3>
              <p className="text-gray-600">
                Quickly report disasters with location, images, and severity detection
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-8 text-center hover:shadow-lg transition">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Volunteer Support</h3>
              <p className="text-gray-600">
                Volunteers can accept requests and coordinate real-time assistance
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8 text-center hover:shadow-lg transition">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Live Map</h3>
              <p className="text-gray-600">
                View disasters and resource requests on an interactive map
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <p className="text-gray-300">Real-time Operations</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">∞</div>
              <p className="text-gray-300">Active Volunteers</p>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <p className="text-gray-300">Community Driven</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 text-gray-100">
            Join our community and help coordinate disaster relief efforts
          </p>
          {!user && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-white text-primary hover:bg-gray-100 border-white"
              >
                Join Now
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
