import ip from 'utils/ips';

const PORT: number = +process.env.SERVER_PORT;

export const getUrl = (params?: string): string => {
  const validParams = params && params[0] !== '/' ? `/${params}` : params;
  return `http://${ip.firstIp}:${PORT}/api${validParams}`;
};

export const url = {
  base: getUrl,
  auth: {
    base: () => getUrl('/auth'),
    login: () => getUrl('/auth/login'),
    signup: () => getUrl('/auth/signup'),
    logout: () => getUrl('/auth/logout'),
    refresh: () => getUrl('/auth/refresh'),
    restore: () => getUrl('/auth/restore'),
    changePassword: () => getUrl('/auth/change-password'),
  },
  user: {
    base: () => getUrl('/user'),
    edit: () => getUrl('/user/edit'),
  },
};
