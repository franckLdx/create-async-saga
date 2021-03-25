# 2.0.0
Add a requestId to actions. This include modification of actions creator interface, which introduce a breaking change.
requestId is generated using nanoid, like createAsyncThunk does.

# 1.0.4
Change SerializedError generation to have a behavior comparable to SerializedError's createAsyncThunk 