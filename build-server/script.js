const { exec } = require('child_process')
const path = require('path')
//built in file system module
const fs = require('fs')
const { S3Client , PutObjectCommand} = require('@aws-sdk/client-s3')
const mime = require('mime-types')
require('dotenv').config();

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

const PROJECT_ID = process.env.PROJECT_ID

async function init(){
    console.log("Executing script.js")

    const outDirPath = path.join(__dirname , 'output');

    //source code is in output dir so we have to go to that directory and install
    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    //when we install and build so we will have some event listeners, it will provide some packages(logs) , we are capturing them
    p.stdout.on('data' , function(data){
        console.log(data.toString()) //buffer
    })

    p.stdout.on('error' , function(data){
        console.log('Error' , data.toString())
    })

    p.on('close' , async function(){
        console.log('Build Complete');
        const distFolderPath = path.join(__dirname , 'output' , 'dist')
        const distFoldercontents = fs.readdirSync(distFolderPath , {recursive : true})

        //iterate over the array of files and folders that we get 
        for(const file of distFoldercontents){
            //as S3 we can only provide files so we skip we found any directory
            const filepath = path.join(distFolderPath , file)
            if(fs.lstatSync(filepath).isDirectory()) continue;

            console.log('uploading' , filepath)

            //read the file and upload it on s3

            const command = new PutObjectCommand({
                Bucket: 'deploypilot',
                Key: `__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filepath),
                ContentType: mime.lookup(filepath)
            })

            //to send the file content on S3
            await s3Client.send(command)
            console.log('uploaded' , filepath)
        }
        console.log('Done..')
    })
}

init()