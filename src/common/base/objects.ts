export function deepClone<T>(obj: T): T {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}
	if (obj instanceof RegExp) {
		return obj;
	}
	const result: any = Array.isArray(obj) ? [] : {};
	Object.entries(obj).forEach(([key, value]) => {
		result[key] = value && typeof value === 'object' ? deepClone(value) : value;
	});
	return result;
}

/** `a.b.c` 경로에 값을 쓴다. 중간 객체는 없으면 생성한다. */
export function setPath(obj: Record<string, unknown>, path: string, value: unknown): void {
	const segments = path.split('.');
	const last = segments.pop()!;
	let cursor = obj;
	for (const segment of segments) {
		if (!cursor[segment] || typeof cursor[segment] !== 'object') {
			cursor[segment] = {};
		}
		cursor = cursor[segment] as Record<string, unknown>;
	}
	cursor[last] = value;
}

/** `a.b.c` 경로로 중첩된 값을 읽는다. */
export function getPath(obj: Record<string, unknown>, path: string): unknown {
	return path.split('.').reduce<unknown>((acc, segment) => {
		if (acc && typeof acc === 'object') {
			return (acc as Record<string, unknown>)[segment];
		}
		return undefined;
	}, obj);
}
