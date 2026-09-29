import { io, Socket } from 'socket.io-client'

class UserSocket {

  static socket: Socket

  constructor() {

    UserSocket.socket = io(process.env.USER_SOCKET_URL!, {
      transports: ['websocket'],
    })

    UserSocket.socket.on('connect', () => {
      console.log('connect user')
    })

  }

  public static setExposer({
    exposer,
    balance,
    userId,
    commision
  }: any) {

    this.socket.emit('updateExposer', {
      exposer,
      balance,
      userId,
      commision
    })

  }

  public static onRollbackPlaceBet(bet: any) {

    this.socket.emit('on-rollback-place-bet', bet)

  }

  public static betDelete({
    betId,
    userId
  }: {
    betId: string
    userId: string
  }) {

    this.socket.emit('betDelete', {
      betId,
      userId
    })

  }

  public static logout(user: any) {

    this.socket.emit('login', user)

  }

  // ==========================================
  // FORCE LOGOUT ONLY ONE USER
  // ==========================================
  public static forceLogout(
    userId: string,
    callback?: (response: any) => void
  ) {

    if (!this.socket) {
      console.error('User socket not initialized')

      callback?.({
        success: false,
        message: 'Socket not initialized'
      })

      return
    }

    console.log('Force logout emit:', userId)

    this.socket.emit(
      'forceLogout',
      userId,
      (response: any) => {

        console.log(
          'Force logout response:',
          response
        )

        callback?.(response)

      }
    )

  }

  // Purana logoutAll
  // Isko single user logout ke liye use MAT karna
  public static logoutAll() {

    this.socket.emit('logoutAll')

  }

  public static logoutsp(userId: any) {

    this.socket.emit(
      'logoutSp',
      userId
    )

  }

}

export default UserSocket