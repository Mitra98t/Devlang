# DevLang

## Code example

### Pari o Dispari

```dl
foo:number = 4

if(foo % 2 == 0)
    print("foo: " + foo + " è pari")
else{
    print("foo: " + foo + " è dispari")
}
```

### Factorial

```dl
foo:number = 5

fun factorial(n:number):number{
    if(n == 0) return 1
    return factorial(n-1) * n
}
```
