import Activity from "../models/activity.model.js"

export const createActivity = async ({ userId, type, fileId = null, shareId = null }) => {
    return Activity.create({
        user: userId,
        type,
        file: fileId,
        share: shareId
    })
}