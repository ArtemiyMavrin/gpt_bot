import { PrismaClient } from '@prisma/client'
import { addSubSeconds, dayToSeconds, nowTimeSecond } from './utils.js'
const db = new PrismaClient()

export async function createUser(userID,userName) {
    try {
        await db.$connect()
        const userExists = await db.user.findUnique({ where: { telegramId: userID }})
        if (!userExists) {
            const sub = addSubSeconds(1)
            await db.user.create({
                data: {
                    telegramId: userID,
                    name: userName,
                    subscribe: sub
                },
            })
        }
    } catch (error) {
        console.error('Ошибка при создании пользователя:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function profileUser(userID, name) {
    try {
        await db.$connect()
        const userExists = await db.user.findUnique({ where: { telegramId: userID }})
        if (!userExists) {
            if (name === "nocreate") {
                return
            }
            await createUser(userID, name)
        }
        return await db.user.findUnique({ where: { telegramId: userID }})
    } catch (error) {
        console.error('Ошибка получения данных пользователя:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function checkSubscribe(userID, name) {
    try {
        const nowTime = nowTimeSecond()
        const user = await profileUser(userID, name)
        const check = Number(user.subscribe) - nowTime
        return check > 0
    } catch (error) {
        console.error('Ошибка получения данных подписки пользователя:', error)
        throw error
    }
}

export async function subscribePay(userID, name, days) {
    try {
        const telegramId = BigInt(userID)
        const nowTime = nowTimeSecond()
        const secondsToAdd = dayToSeconds(days)

        await db.$connect()
        const check = await db.user.findUnique({
            where: { telegramId }
        })
        const newSubscribeTime = check.subscribe >= nowTime
            ? Number(check.subscribe) + secondsToAdd
            : nowTime + secondsToAdd
        await db.user.update({
            where: {
                telegramId
            },
            data: {
                subscribe: newSubscribeTime
            },
        })
    } catch (error) {
        console.error('Ошибка продления подписки:', error);
        throw error;
    } finally {
        await db.$disconnect();
    }
}

export async function allUser(offset, ITEMS_PER_PAGE) {
    try {
        await db.$connect()
        return await db.user.findMany({
            skip: offset,
            take: ITEMS_PER_PAGE,
        })
    } catch (error) {
        console.error('Ошибка получения списка пользователей:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function countUser() {
    try {
        await db.$connect()
        return await db.user.count()
    } catch (error) {
        console.error('Ошибка получения количества пользователей:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function allPromo(offset, ITEMS_PER_PAGE) {
    try {
        await db.$connect()
        return await db.promo.findMany({
            skip: offset,
            take: ITEMS_PER_PAGE,
        })
    } catch (error) {
        console.error('Ошибка получения списка пользователей:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function countPromo() {
    try {
        await db.$connect()
        return await db.promo.count()
    } catch (error) {
        console.error('Ошибка получения количества пользователей:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function createPromo(code,type,meaning,validity) {
    try {
        await db.$connect()
        const promoExists = await db.promo.findUnique({ where: { code: code }})
        if (!promoExists) {
            const valid = addSubSeconds(Number(validity))
            await db.promo.create({
                data: {
                    code: code,
                    type: type,
                    meaning: Number(meaning),
                    validity: valid
                },
            })
        }
        return true
    } catch (error) {
        console.error('Ошибка при создании пользователя:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function promoRemove(id) {
    try {
        await db.$connect()
        const promoExists = await db.promo.findUnique({ where: { id: id }})
        if (promoExists) {
            await db.promo.delete({ where: { id: id }})
            return true
        }
        return false
    } catch (error) {
        console.error('Ошибка при удалении промо:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}

export async function profilePromo(promoID) {
    try {
        await db.$connect()
        const promoExists = await db.promo.findUnique({ where: { id: promoID }})
        return promoExists || false
    } catch (error) {
        console.error('Ошибка получения данных промокода:', error)
        throw error
    } finally {
        await db.$disconnect()
    }
}