import { app } from "electron";

export class EnvironmentService {
  get userDataPath(): string { return app.getPath('userData'); };
}