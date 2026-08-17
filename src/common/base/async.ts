/**
 * 앞선 작업이 끝나야 다음 작업이 시작되도록 Promise를 직렬화하는 최소 큐.
 * (VSCode base/common/async 의 Queue 단순화 버전 — 쓰기 레이스 방지용)
 */
export class Queue {
  private last: Promise<unknown> = Promise.resolve();

  queue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.last.then(task, task);
    // 이전 작업의 실패가 다음 작업까지 막지 않도록 에러는 흡수한 체인을 별도 유지
    this.last = run.then(() => undefined, () => undefined);
    return run;
  }
}