import assert from 'assert';
import { IContextKeyExpr, Context, ContextKeyValue, NSContextKeyExpr } from './ContextKey';


describe('#ContextKey', function () {

  it('basic', function () {

    // const expr = ContextKeyExpr.deserialize('!paneFocused')!;

    // /* assert.deepStrictEqual(
    //   [
    //     expr.evaluate(createContext({})),
    //     expr.evaluate(createContext({ paneFocused: false })),
    //     expr.evaluate(createContext({ paneFocused: true })),
    //   ],
    //   [true, true, false]
    // ); */

    // console.log(expr.evaluate({getValue: (key) => null}));

    // console.log(expr.evaluate({
    //   getValue: <T>(key: string) => {
    //     const v = { paneFocused: false }
    //     return v['paneFocused'] as T;
    //   }
    // }));

    // console.log(expr.evaluate({
    //   getValue: (key) => {
    //     const v = { paneFocused: true }
    //     // return v['paneFocused'] as any; // o
    //     // return v.paneFocused; // x
    //     return v.paneFocused as any;
    //   }
    // }));

    const expr: IContextKeyExpr = NSContextKeyExpr.deserialize('!paneFocused && listFocused || editorFocused')!;

    console.log('expr =', expr);

    function createContext(values: Record<string, ContextKeyValue>): Context {
      return {
        getValue: <T extends ContextKeyValue>(key: string) => values[key] as T | undefined,
      };
    }

    console.log(expr.evaluate(createContext({ paneFocused: false, listFocused: true, editorFocused: false })));

    console.log(expr.evaluate({
      getValue: (key) => {
        const v = { paneFocused: false, listFocused: true, editorFocused: false };
        return v[key];
        // return true as any;
      }
    }));



  });

});
