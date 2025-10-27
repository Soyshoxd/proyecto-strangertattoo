/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Excluir firebase-admin y módulos Node.js del bundle del cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http2: false,
        child_process: false,
        'firebase-admin': false,
        'node:events': false,
        'node:process': false,
        'node:stream': false,
        'node:util': false,
      };
    }

    // Marcar firebase-admin como external para el servidor
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push({
        'firebase-admin': 'commonjs firebase-admin',
      });
    }

    return config;
  },
  // Configuración de imágenes para permitir dominios externos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    forceSwcTransforms: true,
    optimizePackageImports: ['react-icons']
  }
};

module.exports = nextConfig;
