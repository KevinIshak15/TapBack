declare module "passport-google-oauth20" {
  export class Strategy {
    constructor(
      options: { clientID: string; clientSecret: string; callbackURL: string },
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: { emails?: Array<{ value: string }>; name?: { givenName?: string; familyName?: string }; id: string },
        done: (err: Error | null, user?: unknown) => void
      ) => void
    );
  }
}
