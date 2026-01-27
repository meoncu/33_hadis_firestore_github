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
    experimental: {
        serverComponentsExternalPackages: ['undici'],
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            undici: false,
        };
        return config;
    },
};

export default nextConfig;
