const express = require('express')
const { exec } = require('child_process') // ✅ Import exec
const { generateSlug } = require('random-word-slugs')
require('dotenv').config();
const { S3Client } = require('@aws-sdk/client-s3')

const app = express()
const PORT = 9000

console.log('AWS Key:', process.env.AWS_ACCESS_KEY_ID ? 'Loaded' : 'Not Found');
console.log('AWS Secret:', process.env.AWS_SECRET_ACCESS_KEY ? 'Loaded' : 'Not Found');
console.log('Region:', 'ap-south-1');


const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

app.use(express.json())

app.post('/deploy', async (req, res) => {
    const { gitURL, slug } = req.body
    if (!gitURL) {
        return res.status(400).json({ error: 'GitHub URL is required' })
    }

    // Generate a unique slug if not provided
    const projectSlug = slug || generateSlug()

    // Docker command to spin up the container
    const dockerCommand = `
    docker run -d \
    --name build-server-${projectSlug} \
    -e GIT_REPOSITORY__URL="${gitURL}" \
    -e PROJECT_ID="${projectSlug}" \
    -e AWS_ACCESS_KEY_ID="${process.env.AWS_ACCESS_KEY_ID}" \
    -e AWS_SECRET_ACCESS_KEY="${process.env.AWS_SECRET_ACCESS_KEY}" \
    deploypilot-app
`.replace(/\s+/g, ' ');


    exec(dockerCommand, { shell: 'cmd.exe' } , (err, stdout, stderr) => {
        if (err) {
            console.error('Deployment error:', err.message || stderr); // ✅ Improved error logging
            return res.status(500).json({ error: 'Failed to start deployment' })
        }

        console.log(`Container started: ${stdout.trim()}`)
        const deployedURL = `http://${projectSlug}.localhost:8000` // Served via Reverse Proxy

        return res.json({ status: 'queued', data: { projectSlug, deployedURL } })
    })
})

app.listen(PORT, () => console.log(`🚀 API Server running on port ${PORT}`))
