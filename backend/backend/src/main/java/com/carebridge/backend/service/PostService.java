package com.carebridge.backend.service;

import com.carebridge.backend.model.Post;
import com.carebridge.backend.repository.PostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PostService {

    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Transactional
    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    @Transactional(readOnly = true)
    public Page<Post> getActivePosts(Post.Category category, Pageable pageable) {
        if (category != null) {
            return postRepository.findByCategoryAndStatus(category, Post.Status.ACTIVE, pageable);
        }
        return postRepository.findByStatus(Post.Status.ACTIVE, pageable);
    }

    @Transactional(readOnly = true)
    public Post getPostById(UUID postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + postId));
    }

    @Transactional
    public Post upvotePost(UUID postId) {
        Post post = getPostById(postId);
        post.setUpvotes(post.getUpvotes() + 1);
        return postRepository.save(post);
    }

    @Transactional
    public void flagPost(UUID postId) {
        Post post = getPostById(postId);
        post.setStatus(Post.Status.FLAGGED);
        postRepository.save(post);
    }

    @Transactional
    public void approveForAi(UUID postId) {
        Post post = getPostById(postId);
        post.setAiApproved(true);
        postRepository.save(post);
    }
}