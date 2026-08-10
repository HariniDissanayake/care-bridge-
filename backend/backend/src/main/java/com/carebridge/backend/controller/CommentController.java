package com.carebridge.backend.controller;

import com.carebridge.backend.model.Comment;
import com.carebridge.backend.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable UUID postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<Comment> addComment(
            @PathVariable UUID postId,
            @RequestParam UUID userId,
            @RequestBody String content) {
        Comment comment = commentService.addComment(postId, userId, content);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<Comment> upvoteComment(@PathVariable UUID id) {
        return ResponseEntity.ok(commentService.upvoteComment(id));
    }
}