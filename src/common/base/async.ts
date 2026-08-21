/**
 * 앞선 작업이 끝나야 다음 작업이 시작되도록 Promise를 직렬화하는 최소 큐.
 * (VSCode base/common/async 의 Queue 단순화 버전)
 */
export class Queue {

  ///* 1번 버전
  // 이전 작업의 진행 상황을 들고 있는 Promise
  private last: Promise<any> = Promise.resolve();

  // 비동기 함수를 큐에 넣고 순서대로 실행합니다.
  queue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.last.then(task, task);
    // 이전 작업의 실패가 다음 작업까지 막지 않도록 에러는 흡수한 체인을 별도 유지
    this.last = run.then(() => undefined, () => undefined);
    return run;
  }
  //*/

  /* 2번 버전
  // 이전 작업의 진행 상황을 들고 있는 Promise
  private chain: Promise<any> = Promise.resolve();

  // 비동기 함수를 큐에 넣고 순서대로 실행합니다.
  public queue<T>(task: () => Promise<T>): Promise<T> {
    // 이전 작업(chain)이 끝나면(성공/실패 상관없이) 새 task를 실행시킵니다.
    const next = this.chain.then(
      () => task(),
      () => task() // 이전 작업이 에러가 나도 멈추지 않고 다음 작업을 진행
    );

    // 다음 작업을 위해 체인을 갱신합니다.
    this.chain = next;

    return next;
  } */
}

export function timeout(millis: number) {
  return new Promise((resolve) => setTimeout(resolve, millis));
}
