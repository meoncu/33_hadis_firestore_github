/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
        ],
    },
    // Transpile packages that use modern JS syntax not supported by the default build loader
    transpilePackages: [
        'firebase',
        '@firebase/auth',
        '@firebase/app',
        '@firebase/firestore',
        '@firebase/storage',
        'undici'
    ],
};

export default nextConfig;
