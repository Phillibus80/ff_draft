import path from 'path';
import {fileURLToPath} from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    sassOptions: {
        includePaths: [path.join(dirname, 'styles')],
    },
};

export default nextConfig;
