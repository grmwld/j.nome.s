#include <algorithm>
#include <v8.h>
#include <node.h>

using namespace v8;
using namespace node;

static Handle<Value> processProfile(const Arguments& args)
{
    Local<String> kstart = String::New("start");
    Local<String> kend = String::New("end");
    Local<String> kscore = String::New("score");
    Local<String> kseqid = String::New("seqid");
    Local<String> vseqid;
    Local<Array> output;
    Local<Array> input;
    Local<Object> doc;
    Local<Object> point;
    unsigned int length = 0;
    unsigned int score = 0;
    unsigned int step;
    unsigned int input_length;
    unsigned int doc_start;
    unsigned int doc_end;
    unsigned int doc_score;
    unsigned int start;
    unsigned int i;
    unsigned int j;
    
    if (!args[0]->IsArray())
    {
        return ThrowException(Exception::Error(String::New("Argument should be an array.")));
    }

    input = Local<Array>(Array::Cast(*args[0]));
    step = args[1]->ToNumber()->NumberValue();
    vseqid = input->Get(Number::New(0))->ToObject()->Get(kseqid)->ToString();
    input_length = input->Length();
    start = input->Get(Number::New(0))->ToObject()->Get(kstart)->NumberValue();
    output = Array::New(2000);

    for (i = 0; i < input_length; ++i)
    {
        doc = input->Get(Number::New(i))->ToObject();
        doc_start = doc->Get(kstart)->NumberValue();
        doc_end = doc->Get(kend)->NumberValue();
        doc_score = doc->Get(kscore)->NumberValue();

        for (j = doc_start; j < doc_end; ++j)
        {
            score += doc_score;
            length++;

            if (length == step)
            {
                point = Object::New();
                point->Set(kseqid, vseqid);
                point->Set(kstart, Number::New(start));
                point->Set(kend, Number::New(start + length));
                point->Set(kscore, Number::New(score / length));
                output->Set(Number::New(output->Length()), point);
                score = 0;
                start = j;
                length = 0;
            }
        }
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

