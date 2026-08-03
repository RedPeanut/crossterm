import { app } from "electron";
import { EnvironmentService } from "../../common/service/EnvironmentService";

export class MainEnvironmentService implements EnvironmentService {
  get userDataPath(): string { return app.getPath('userData'); };
}