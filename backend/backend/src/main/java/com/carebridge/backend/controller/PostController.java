package com.carebridge.backend.controller;

import com.carebridge.backend.model.Post;
import com.carebridge.backend.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<Page<Post>> getPosts(
            @RequestParam(required = false) Post.Category category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(postService.getActivePosts(category, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable UUID id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        Post createdPost = postService.createPost(post);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<Post> upvotePost(@PathVariable UUID id) {
        return ResponseEntity.ok(postService.upvotePost(id));
    }

    @PostMapping("/{id}/flag")
    public ResponseEntity<Void> flagPost(@PathVariable UUID id) {
        postService.flagPost(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/approve-ai")
    public ResponseEntity<Void> approveForAi(@PathVariable UUID id) {
        postService.approveForAi(id);
        return ResponseEntity.noContent().build();
    }
}