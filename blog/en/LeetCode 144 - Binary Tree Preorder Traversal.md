---
draft: false
title: "LeetCode 144 - Binary Tree Preorder Traversal"
date: 2020-11-03
categories:
    - Learning Notes
tags:
    - C++
    - LeetCode
description: "Given the root of a binary tree, return the preorder traversal of its nodes' values."
---

Simple recursion, iterative algorithm, Morris algorithm
<!--more-->

### Simple Recursion

```cpp
/*
 * @lc app=leetcode.cn id=144 lang=cpp
 *
 * [144] 二叉树的前序遍历
 */

#include <iostream>
#include <vector>
//  Definition for a binary tree node.
struct TreeNode
{
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};

using namespace std;
// @lc code=start

class Solution
{
public:
    vector<int> preorderTraversal(TreeNode *root)
    {
        if (root == nullptr)
        {
            vector<int> empty;
            return empty;
        }
        vector<int> result{root->val};
        vector<int> leftResult = preorderTraversal(root->left);
        if (!leftResult.empty())
        {
            result.insert(result.end(), leftResult.begin(), leftResult.end());
        }
        vector<int> rightResul = preorderTraversal(root->right);
        if (!rightResul.empty())
        {
            result.insert(result.end(), rightResul.begin(), rightResul.end());
        }
        return result;
    }
};
// @lc code=end

```

Note the method for merging two `vector`s here:

```cpp
result.insert(result.end(), //place you want to insert at
              leftResult.begin(), 
              //An overload version with two iterator of vector
              leftResult.end());
```

Time complexity: O(n), where n is the number of nodes in the binary tree. In tree traversal, each node is visited exactly once.

Space complexity: O(n). The space complexity depends on the depth of the recursion stack, which can reach O(n) in the case where the binary tree is a chain.

### Iterative

The iterative approach uses a stack. The rationale is: for every subtree, we always visit the root first, then left, then right. So we push the subtree onto the stack. For the top element in the stack, we output the root, then push its left and right subtrees onto the stack respectively. Since we want to output the left subtree first and the stack is LIFO (Last-In-First-Out), we need to push the right subtree first, then the left subtree.

```cpp
vector<int> preorderTraversal(TreeNode *root)
    {
        vector<int> result;
        if (root == nullptr)
        {
            return result;
        }
        stack<TreeNode*> theStack;
        theStack.push(root);
        while (!theStack.empty())
        {
            TreeNode* pointer = theStack.top();
            result.push_back(pointer->val);
            theStack.pop();
            if (pointer->right != nullptr)
            {
                theStack.push(pointer->right);
            }
            if (pointer->left != nullptr)
            {
                theStack.push(pointer->left);
            }
        }
       return result; 
    }
```

Thanks to extensive use of high-quality algorithms provided by the STL, this solution beat 100% of LeetCode C++ submissions. However, the memory usage is still quite large due to stack maintenance. Is there a way to save more memory?

> "Can we do even better?"

### Morris Algorithm

```python 
def preorderTraversal(self, root: TreeNode) -> List[int]:
        self.result = []
        current = root  # current node set to root
        while current:
            if not current.left:  # preorder traversal is root-left-right order; when there is no left subtree, output the value directly and move to the right subtree
                self.result.append(current.val)
                current = current.right
            else:  # when there is a left subtree, find the inorder predecessor of the root node, which is the rightmost node in the left subtree
                pre = current.left
                while pre.right and pre.right!=current:  # check if the right subtree of the rightmost node in the left subtree (originally null) is empty
                    pre = pre.right
                if not pre.right:  
                	# when the right subtree is null, it means this root node is being visited for the first time
                	# according to preorder root-left-right, the root node should be output on first visit
                	#
                	# the difference between preorder and inorder traversal is that inorder is left-root-right, and the root is output when returning from left to root
                	# so in inorder traversal, the root is output on the second visit
                	#
                	# on first visit to the root node, point the null memory of the right subtree of the inorder predecessor to the root node
                	# then according to root-left-right order, after visiting the root we need the left subtree, so move current to the left subtree
                    self.result.append(current.val)
                    pre.right = current
                    current = current.left
                else:
                	# at this point, the null memory of the right subtree of the inorder predecessor now points to the root node
                	# this means the root node has finished visiting the left subtree and returned to the root; this is the second visit
                	# now we need to restore the right subtree of the inorder predecessor to null, returning to the original tree structure
                	# then move current to the right subtree
                    pre.right = None
                    current = current.right
        return self.result
```

