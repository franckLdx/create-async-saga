# 2.1.9

Update dependencies

# 2.1.8

Update dependencies

# 2.1.7

Update dependencies & Readme

# 2.1.6

Update dependencies & Readme

# 2.1.5

Update dependencies & Readme

# 2.1.4

Update dependencies & fix fulfilled action type

# 2.1.3

Update dependencies

# 2.1.2

Update dependencies

# 2.1.1

Update dependencies

# 2.1.0

Add dispatchConditionRejection feature. Rejected action now has a condition property in its meta. condition===true
when async saga is rejected because its condition is false.

# 2.0.0

Add a requestId to actions. This include modification of actions creator interface, which introduce a breaking change.
requestId is generated using nanoid, like createAsyncThunk does.

# 1.0.4

Change SerializedError generation to have a behavior comparable to SerializedError's createAsyncThunk
