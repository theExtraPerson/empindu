import { useState, useEffect } from 'react';
import { getArtisans, getProducts, checkApiHealth } from '@/lib/api';

export function ApiTest() {
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [artisans, setArtisans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await checkApiHealth();
      setApiHealthy(healthy);
    };
    checkHealth();
  }, []);

  const fetchArtisans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getArtisans();
      setArtisans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
        Django Backend Integration Test
      </h1>

      {/* API Health Status */}
      <div style={{ 
        padding: '1rem', 
        marginBottom: '2rem',
        borderRadius: '8px',
        backgroundColor: apiHealthy ? '#dcfce7' : apiHealthy === false ? '#fee2e2' : '#fef3c7'
      }}>
        <strong>API Status:</strong>{' '}
        {apiHealthy === null ? (
          <span>Checking...</span>
        ) : apiHealthy ? (
          <span style={{ color: '#16a34a' }}>✅ Connected to Django Backend</span>
        ) : (
          <span style={{ color: '#dc2626' }}>❌ Cannot connect to backend</span>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={fetchArtisans}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2D6A4F',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Loading...' : 'Load Artisans'}
        </button>

        <button
          onClick={fetchProducts}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#40916C',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Loading...' : 'Load Products'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '1rem',
          marginBottom: '2rem',
          backgroundColor: '#fee2e2',
          borderRadius: '6px',
          color: '#991b1b',
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Artisans Grid */}
      {artisans.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Artisans ({artisans.length})
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {artisans.map((artisan) => (
              <div
                key={artisan.slug}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}
              >
                {artisan.profile_photo_url && (
                  <img
                    src={artisan.profile_photo_url}
                    alt={artisan.full_name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginBottom: '1rem',
                    }}
                  />
                )}
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  {artisan.full_name}
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  📍 {artisan.community}, {artisan.district}
                </p>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
                  🎨 {artisan.craft_tradition}
                </p>
                {artisan.is_certified && (
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#52B788',
                    color: 'white',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>
                    ✅ Certified
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Products ({products.length})
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {products.map((product) => (
              <div
                key={product.slug}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}
              >
                {product.hero_photo_url && (
                  <img
                    src={product.hero_photo_url}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginBottom: '1rem',
                    }}
                  />
                )}
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                  {product.name}
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  By {product.artisan.name}
                </p>
                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2D6A4F' }}>
                  UGX {product.price_ugx.toLocaleString()}
                </p>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    💰 Artisan earns: UGX {product.artisan_earnings_ugx?.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    🌱 Heritage Fund: UGX {product.heritage_fund_ugx?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {artisans.length === 0 && products.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#6b7280',
        }}>
          <p style={{ fontSize: '1.125rem' }}>
            Click a button above to test the API connection
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Make sure Django backend is running at http://127.0.0.1:8000
          </p>
        </div>
      )}
    </div>
  );
}
