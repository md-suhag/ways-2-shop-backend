/* eslint-disable @typescript-eslint/no-non-null-assertion */
import colors from 'colors';
import { User } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';
import { IAuthProvider, IUser } from '../app/modules/user/user.interface';

  const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: config.super_admin.email!
    };

const superUser:Partial<IUser> = {
    name: 'Super Admin',
    role: USER_ROLES.SUPER_ADMIN,
    email: config.super_admin.email,
    password: config.super_admin.password,
    isVerified: true,
    authProviders:[authProvider]
};

const seedSuperAdmin = async () => {
    const isExistSuperAdmin = await User.findOne({
        role: USER_ROLES.SUPER_ADMIN,
    });

    if (!isExistSuperAdmin) {
        await User.create(superUser);
        logger.info(colors.green('✔ Super admin created successfully!'));
    }
};

export default seedSuperAdmin;