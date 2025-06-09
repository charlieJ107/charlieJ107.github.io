---
title: 'LeetCode 144.二叉树的前序遍历'
date: 2020-11-03
categories: # 分类
    - 学了就忘
tags: # 标签
    - C++
    - LeetCode
description: "给你二叉树的根节点 root ，返回它节点值的 前序 遍历。"
---
简单递归，迭代算法，莫里斯算法
<!--more-->
### 简单递归

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

注意这里合并两个`vector`的方法：

```cpp
result.insert(result.end(), //place you want to insert at
              leftResult.begin(), 
              //An overload version with two iterator of vector
              leftResult.end());
```

时间复杂度：O ( n ) ，其中 n 为二叉树节点的个数。二叉树的遍历中每个节点会被访问一次且只会被访问一次。
空间复杂度：O ( n ) 。空间复杂度取决于递归的栈深度，而栈深度在二叉树为一条链的情况下会达到 O ( n ) 的级别

### 迭代

迭代使用的是栈，其依据是：反正对于每个子树，都是先根，再左，再右，那就把字数压进栈里，对于栈顶的元素，输出根，再把栈顶的元素左右子树分别压入栈。因为先输出左边，后进先出（FILO）的栈需要先压入右子树，再压入左子树。

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

得益于大量使用STL提供的高质量算法，这个答案击败了LeetCode100%的C++提交，但还是内存占用太大了，因为涉及到栈的维护，有没有什么办法，可以更加节省内存呢？

> “还能不能再给力一点？”

### 莫里斯算法

```python 
def preorderTraversal(self, root: TreeNode) -> List[int]:
        self.result = []
        current = root  # 当前节点设置为根节点
        while current:
            if not current.left:  # 前序遍历是中左右的顺序，当没有左子树时，直接输出值，并转到右子树上
                self.result.append(current.val)
                current = current.right
            else:  # 当存在左子树时，找到根节点的中序前驱节点，也就是左子树的最右的叶子
                pre = current.left
                while pre.right and pre.right!=current:  # 判断左子树的最右叶子的右子树(本来是空内存)是否为空
                    pre = pre.right
                if not pre.right:  
                	# 当右子树是空，说明该根节点是第一次被访问
                	# 按照前序 中左右，根节点第一次被访问时就应该输出
                	#
                	# 前序和中序遍历不一样的地方在于，中序遍历是左中右，是从中到左到中的时候才将根节点输出
                	# 所以中序遍历是在第二次访问节点是输出
                	#
                	# 第一次访问根节点时，将中序前驱节点的右子树空内存指向根节点
                	# 然后按照中左右的顺序，访问了根节点就需要左子树，将当前节点转向左子树，
                    self.result.append(current.val)
                    pre.right = current
                    current = current.left
                else:
                	# 此时中序前驱节点的右子树的本来是空的内存已经指向了根节点
                	# 说明当前的根节点，已经是从左子树访问完了又回到了根节点，第二次访问根节点了
                	# 此时就需要将中序前序节点的右子树的内存值为空，回到最初树的形状
                	# 然后当前节点转向右子树
                    pre.right = None
                    current = current.right
        return self.result
```

