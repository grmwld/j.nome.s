#include <v8.h>
#include <node.h>

using namespace v8;
using namespace node;

static Handle<Value> processProfile(const Arguments& args)
{
    int i;
    Local<Array> input = Array::New()
    Local<Array> output = Array::New();
    
    if (!args[0]->IsArray())
    {
        return ThrowException(Exception::Error(String::New("Argument should be an array.")));
    }
    for (i = 0; i < args[0]->Length(); ++i)
    {
        output->Set(
                Number::New(i),
                args[0]->Get(Number::New(i))->ToObject()->Get(String::New("r"))
        );
    }
    return output;
}

extern "C" {
    static void init(Handle<Object> target)
    {
        NODE_SET_METHOD(target, "processProfile", processProfile);
    }
    NODE_MODULE(cutils, init);
}
