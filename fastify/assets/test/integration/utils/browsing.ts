import { FastifyInstance } from "fastify";

export const setTags = async (app: FastifyInstance, token: string, tags: Array<string>) => {
    await app.inject({
        method: 'PUT',
        url: `/private/user/me/profile`,
        headers: {
            'Cookie': `jwt=${token}`
        },
        payload: {
            tags: tags
        }
    });
}

export const viewUser = async (app: FastifyInstance, token: string, likedUserId: number) => {
    await app.inject({
        method: 'GET',
        url: `/private/user/view/${likedUserId}`,
        headers: {
            'Cookie': `jwt=${token}`
        }
    });
};

export const likeUser = async (app: FastifyInstance, token: string, likedUserId: number) => {
    await app.inject({
        method: 'POST',
        url: `/private/user/like/${likedUserId}`,
        headers: {
            'Cookie': `jwt=${token}`
        }
    });
};

export const setLocalisation = async (app: FastifyInstance, token: string, lat: number, lgn: number) => {
    await app.inject({
        method: 'PUT',
        url: `/private/user/me/profile`,
        headers: {
            'Cookie': `jwt=${token}`
        },
        payload: {
            location: {
                latitude: lat,
                longitude: lgn
            }
        }
    });
};

export const setBirthDate = async (app: FastifyInstance, token: string, birthdate: string) => {
    const response = await app.inject({
        method: 'PUT',
        url: `/private/user/me/profile`,
        headers: {
            'Cookie': `jwt=${token}`
        },
        payload: {
            bornAt: new Date(birthdate).toISOString()
        }
    });
    console.log(response.statusCode);
}

export const getAgeDifference = (birthdate1: string, birthdate2: string): number => {
    const date1 = new Date(birthdate1);
    const date2 = new Date(birthdate2);

    const age1 = new Date().getTime() - date1.getTime();
    const age2 = new Date().getTime() - date2.getTime();

    return Math.abs(age1 - age2);
}