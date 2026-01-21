import { Response, NextFunction, Request } from 'express'
import { Friendship, FriendshipResponse, FriendRequest } from '../models/friend.js'
import { User } from '../models/user.js'
import { GenericDAO } from '../models/generic.dao.js'
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js'

const getFriendshipDAO = (req: Request) =>
    req.app.locals['friendshipDAO'] as GenericDAO<Friendship>

const getUserDAO = (req: Request) =>
    req.app.locals['userDAO'] as GenericDAO<User>

/**
 * Get all friends of the current user
 * GET /api/friends
 */
export const getFriends = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const friendshipDAO = getFriendshipDAO(req)
        const userDAO = getUserDAO(req)
        const userId = req.userId

        const allFriendships = await friendshipDAO.findAll()

        // Filter friendships where user is involved and status is accepted
        const userFriendships = allFriendships.filter(
            (f) =>
                (f.requesterId === userId || f.addresseeId === userId) &&
                f.status === 'accepted'
        )

        // Get friend details
        const friends: FriendshipResponse[] = await Promise.all(
            userFriendships.map(async (friendship) => {
                const friendId =
                    friendship.requesterId === userId
                        ? friendship.addresseeId
                        : friendship.requesterId

                const friend = await userDAO.findOne({ id: friendId } as Partial<User>)

                return {
                    id: friendship.id,
                    friendId,
                    friendName: friend?.name || 'Unbekannt',
                    friendEmail: friend?.email || '',
                    friendAvatar: friend?.avatar,
                    status: friendship.status,
                    isRequester: friendship.requesterId === userId,
                    createdAt: friendship.createdAt?.toISOString() || '',
                    updatedAt: friendship.updatedAt?.toISOString() || '',
                }
            })
        )

        res.status(200).json({
            success: true,
            data: friends,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get pending friend requests (received)
 * GET /api/friends/requests
 */
export const getFriendRequests = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const friendshipDAO = getFriendshipDAO(req)
        const userDAO = getUserDAO(req)
        const userId = req.userId

        const allFriendships = await friendshipDAO.findAll()

        // Filter pending requests where current user is addressee
        const pendingRequests = allFriendships.filter(
            (f) => f.addresseeId === userId && f.status === 'pending'
        )

        // Get requester details
        const requests: FriendRequest[] = await Promise.all(
            pendingRequests.map(async (friendship) => {
                const requester = await userDAO.findOne({
                    id: friendship.requesterId,
                } as Partial<User>)

                return {
                    id: friendship.id,
                    from: {
                        id: friendship.requesterId,
                        name: requester?.name || 'Unbekannt',
                        email: requester?.email || '',
                        avatar: requester?.avatar,
                    },
                    createdAt: friendship.createdAt?.toISOString() || '',
                }
            })
        )

        res.status(200).json({
            success: true,
            data: requests,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Get sent friend requests (pending)
 * GET /api/friends/requests/sent
 */
export const getSentRequests = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const friendshipDAO = getFriendshipDAO(req)
        const userDAO = getUserDAO(req)
        const userId = req.userId

        const allFriendships = await friendshipDAO.findAll()

        // Filter pending requests where current user is requester
        const sentRequests = allFriendships.filter(
            (f) => f.requesterId === userId && f.status === 'pending'
        )

        // Get addressee details
        const requests = await Promise.all(
            sentRequests.map(async (friendship) => {
                const addressee = await userDAO.findOne({
                    id: friendship.addresseeId,
                } as Partial<User>)

                return {
                    id: friendship.id,
                    to: {
                        id: friendship.addresseeId,
                        name: addressee?.name || 'Unbekannt',
                        email: addressee?.email || '',
                        avatar: addressee?.avatar,
                    },
                    createdAt: friendship.createdAt?.toISOString() || '',
                }
            })
        )

        res.status(200).json({
            success: true,
            data: requests,
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Send a friend request
 * POST /api/friends/request
 */
export const sendFriendRequest = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const friendshipDAO = getFriendshipDAO(req)
        const userDAO = getUserDAO(req)
        const userId = req.userId
        const { email } = req.body

        // Find user by email
        const targetUser = await userDAO.findOne({ email } as Partial<User>)

        if (!targetUser) {
            res.status(404).json({ message: 'Benutzer nicht gefunden' })
            return
        }

        if (targetUser.id === userId) {
            res.status(400).json({
                message: 'Du kannst dir selbst keine Freundschaftsanfrage senden',
            })
            return
        }

        // Check if friendship already exists
        const allFriendships = await friendshipDAO.findAll()
        const existingFriendship = allFriendships.find(
            (f) =>
                (f.requesterId === userId && f.addresseeId === targetUser.id) ||
                (f.requesterId === targetUser.id && f.addresseeId === userId)
        )

        if (existingFriendship) {
            if (existingFriendship.status === 'accepted') {
                res.status(400).json({ message: 'Ihr seid bereits Freunde' })
                return
            }
            if (existingFriendship.status === 'pending') {
                res.status(400).json({
                    message: 'Es existiert bereits eine ausstehende Anfrage',
                })
                return
            }
        }

        // Create new friendship request
        const newFriendship = await friendshipDAO.create({
            requesterId: userId,
            addresseeId: targetUser.id,
            status: 'pending',
        } as Omit<Friendship, 'id' | 'createdAt' | 'updatedAt'>)

        res.status(201).json({
            success: true,
            data: newFriendship,
            message: 'Freundschaftsanfrage gesendet',
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Respond to a friend request (accept/reject)
 * POST /api/friends/requests/:requestId/respond
 */
export const respondToRequest = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const friendshipDAO = getFriendshipDAO(req)
        const userId = req.userId
        const { requestId } = req.params
        const { accept } = req.body

        const friendship = await friendshipDAO.findOne({
            id: requestId,
        } as Partial<Friendship>)

        if (!friendship) {
            res.status(404).json({ message: 'Anfrage nicht gefunden' })
            return
        }

        if (friendship.addresseeId !== userId) {
            res.status(403).json({
                message: 'Du bist nicht berechtigt, diese Anfrage zu beantworten',
            })
            return
        }

        if (friendship.status !== 'pending') {
            res.status(400).json({ message: 'Diese Anfrage wurde bereits beantwortet' })
            return
        }

        const updated = await friendshipDAO.update({
            id: requestId,
            status: accept ? 'accepted' : 'rejected',
        } as Partial<Friendship>)

        if (!updated) {
            res.status(500).json({ message: 'Fehler beim Aktualisieren der Anfrage' })
            return
        }

        res.status(200).json({
            success: true,
            message: accept ? 'Freundschaftsanfrage angenommen' : 'Freundschaftsanfrage abgelehnt',
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Cancel a sent friend request
 * DELETE /api/friends/requests/:requestId
 */
export const cancelRequest = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const friendshipDAO = getFriendshipDAO(req)
        const userId = req.userId
        const { requestId } = req.params

        const friendship = await friendshipDAO.findOne({
            id: requestId,
        } as Partial<Friendship>)

        if (!friendship) {
            res.status(404).json({ message: 'Anfrage nicht gefunden' })
            return
        }

        if (friendship.requesterId !== userId) {
            res.status(403).json({
                message: 'Du kannst nur deine eigenen Anfragen zurückziehen',
            })
            return
        }

        if (friendship.status !== 'pending') {
            res.status(400).json({ message: 'Diese Anfrage kann nicht mehr zurückgezogen werden' })
            return
        }

        await friendshipDAO.delete(requestId)

        res.status(200).json({
            success: true,
            message: 'Freundschaftsanfrage zurückgezogen',
        })
    } catch (error) {
        next(error)
    }
}

/**
 * Remove a friend
 * DELETE /api/friends/:friendId
 */
export const removeFriend = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const friendshipDAO = getFriendshipDAO(req)
        const userId = req.userId
        const { friendId } = req.params

        const allFriendships = await friendshipDAO.findAll()
        const friendship = allFriendships.find(
            (f) =>
                ((f.requesterId === userId && f.addresseeId === friendId) ||
                    (f.requesterId === friendId && f.addresseeId === userId)) &&
                f.status === 'accepted'
        )

        if (!friendship) {
            res.status(404).json({ message: 'Freundschaft nicht gefunden' })
            return
        }

        await friendshipDAO.delete(friendship.id)

        res.status(200).json({
            success: true,
            message: 'Freund entfernt',
        })
    } catch (error) {
        next(error)
    }
}
