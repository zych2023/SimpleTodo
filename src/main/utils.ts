import dayjs from 'dayjs'

export function getNowDate(): string {
  return dayjs().format('YYYY/MM/DD')
}

export function getNowDateTime(): string {
  return dayjs().format('YYYY/MM/DD HH:mm:ss')
}

export function getNowDateTimeForFileName(): string {
  return dayjs().format('YYYYMMDDHHmmss')
}
