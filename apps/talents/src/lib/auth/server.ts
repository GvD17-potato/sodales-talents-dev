import "server-only";

import { createNeonAuth } from "@neondatabase/auth/next/server";
import { getNeonAuthEnvironment } from "./environment";

const environment = getNeonAuthEnvironment();

export const auth = createNeonAuth({
  baseUrl: environment.baseUrl,
  cookies: { secret: environment.cookieSecret },
});
