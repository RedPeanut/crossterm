export class Component {

  constructor(
		private readonly id: string
  ) {}

  getId(): string {
    return this.id;
  }
}