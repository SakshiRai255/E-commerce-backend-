import s3 from "../config/s3Config.js";


export const s3FileUpload = async({bucketName, Key , body}) =>{
    return await s3.upload({
        Bucket : bucketName,
        Key:key,
        Body:body,
        ContentType:contentType,
    })
    .promise()
}
export const deleteFile = async ({bucketName, key})=>{
    return await s3.deleteObject({
        Bucket:bucketName,
        Key:key
    })
    .promise()
}