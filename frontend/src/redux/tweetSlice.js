import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tweetService from '../services/tweet.service';

// Async thunks
export const fetchFeed = createAsyncThunk(
  'tweets/fetchFeed',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tweetService.getFeed();
      return response.tweets;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch tweets');
    }
  }
);

export const fetchUserTweets = createAsyncThunk(
  'tweets/fetchUserTweets',
  async (username, { rejectWithValue }) => {
    try {
      const response = await tweetService.getUserTweets(username);
      return response.tweets;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch user tweets');
    }
  }
);

export const postTweet = createAsyncThunk(
  'tweets/postTweet',
  async (tweetData, { rejectWithValue }) => {
    try {
      // tweetData will be FormData if there's an image, or a simple object if text only
      const response = await tweetService.createTweet(tweetData);
      return response.tweet;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to post tweet');
    }
  }
);

export const likeTweet = createAsyncThunk(
  'tweets/likeTweet',
  async (tweetId, { rejectWithValue }) => {
    try {
      const response = await tweetService.toggleLike(tweetId);
      return { tweetId, liked: response.liked, likesCount: response.likesCount };
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to like/unlike tweet');
    }
  }
);

export const removeTweet = createAsyncThunk(
  'tweets/removeTweet',
  async (tweetId, { rejectWithValue }) => {
    try {
      await tweetService.deleteTweet(tweetId);
      return tweetId;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete tweet');
    }
  }
);

// Initial state
const initialState = {
  feed: [],
  userTweets: [],
  loading: false,
  error: null,
  posting: false,
  postSuccess: false,
  postError: null
};

// Slice
const tweetSlice = createSlice({
  name: 'tweets',
  initialState,
  reducers: {
    clearPostStatus: (state) => {
      state.posting = false;
      state.postSuccess = false;
      state.postError = null;
    },
    resetTweetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch feed
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.feed = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch user tweets
      .addCase(fetchUserTweets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTweets.fulfilled, (state, action) => {
        state.loading = false;
        state.userTweets = action.payload;
      })
      .addCase(fetchUserTweets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Post tweet
      .addCase(postTweet.pending, (state) => {
        state.posting = true;
        state.postSuccess = false;
        state.postError = null;
      })
      .addCase(postTweet.fulfilled, (state, action) => {
        state.posting = false;
        state.postSuccess = true;
        state.feed = [action.payload, ...state.feed];
      })
      .addCase(postTweet.rejected, (state, action) => {
        state.posting = false;
        state.postError = action.payload;
      })
      
      // Like tweet
      .addCase(likeTweet.fulfilled, (state, action) => {
        const { tweetId, liked, likesCount } = action.payload;
        
        // Update like status in both feed and userTweets
        const updateTweetList = (list) => {
          return list.map(tweet => 
            tweet._id === tweetId 
              ? { 
                  ...tweet, 
                  likes: liked 
                    ? [...(tweet.likes || []), action.meta.arg.userId] 
                    : (tweet.likes || []).filter(id => id !== action.meta.arg.userId),
                  likesCount
                }
              : tweet
          );
        };
        
        state.feed = updateTweetList(state.feed);
        state.userTweets = updateTweetList(state.userTweets);
      })
      
      // Delete tweet
      .addCase(removeTweet.fulfilled, (state, action) => {
        const tweetId = action.payload;
        state.feed = state.feed.filter(tweet => tweet._id !== tweetId);
        state.userTweets = state.userTweets.filter(tweet => tweet._id !== tweetId);
      });
  }
});

export const { clearPostStatus, resetTweetState } = tweetSlice.actions;
export default tweetSlice.reducer;
