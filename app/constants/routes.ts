import ip from 'utils/ips';

const PORT: number = +process.env.SERVER_PORT ?? 3001;

// export const protocol: string = process.env.NODE_ENV === 'production' ? 'https': 'http'
// export const serverIp = process.env.NODE_ENV === 'production' ? 'server' : (process.env.SERVER_IP || ip.firstIp)

export const protocol: string = process.env.LOCAL === 'true' ? 'http' : 'https';
export const serverIp = process.env.SERVER_IP || ip.firstIp

export const getUrl = (params: string = ''): string => {
  const validParams = params && params[0] !== '/' ? `/${params}` : params;
  return `${protocol}://${serverIp}:${PORT}/api${validParams}`;
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
