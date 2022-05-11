import React from "react";
import { Session } from "@inrupt/solid-client-authn-browser";

import { SolidProfileShape } from "../shex/generated";

export const CurrentUserAuthContext: React.Context<{
  session?: Session;
  user?: SolidProfileShape;
}> = React.createContext({});
